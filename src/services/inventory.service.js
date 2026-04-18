import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { formatInventoryPayload, resolveOrderStatus, resolveStockStatus } from '@/utils/inventory';
import { STARTER_ACTIVITY_LOG, STARTER_INVENTORY_ITEMS, STARTER_SUPPLIERS } from '@/utils/sampleInventory';

const INVENTORY_COLLECTION = 'inventoryItems';
const SUPPLIERS_COLLECTION = 'suppliers';
const TRANSACTIONS_COLLECTION = 'inventoryTransactions';

function normalizeName(value = '') {
  return value.trim().toLowerCase();
}

function normalizeSku(value = '') {
  return value.trim().toUpperCase();
}

function getActorMetadata() {
  return {
    actorName: auth.currentUser?.displayName || auth.currentUser?.email || 'Signed-in user',
    actorEmail: auth.currentUser?.email || '',
  };
}

function createDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapSnapshotToItem(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    supplierId: data.supplierId ?? null,
    purchaseOrderNumber: data.purchaseOrderNumber ?? null,
    quantityOnOrder: data.quantityOnOrder ?? 0,
    orderStatus: data.orderStatus ?? 'none',
    orderedOn: data.orderedOn ?? null,
    expectedOn: data.expectedOn ?? null,
    receivedOn: data.receivedOn ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

function mapSnapshotToTransaction(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

function toTimestamp(dateString, fallback = '2026-04-01T09:00:00Z') {
  return Timestamp.fromDate(new Date(dateString || fallback));
}

function getItemCreatedAt(item) {
  return toTimestamp(item.orderedOn ? `${item.orderedOn}T08:30:00Z` : undefined);
}

function getItemUpdatedAt(item) {
  const latestDate = item.receivedOn || item.expectedOn || item.orderedOn;
  return toTimestamp(latestDate ? `${latestDate}T16:15:00Z` : undefined);
}

function createTransactionSeedKey({ type, sku, note, effectiveOn, purchaseOrderNumber, inventoryItemName }) {
  return [type, normalizeSku(sku || inventoryItemName || ''), note || '', effectiveOn || '', purchaseOrderNumber || ''].join('|');
}

async function getSupplierDirectory(workspaceId) {
  const suppliersQuery = query(collection(db, SUPPLIERS_COLLECTION), where('workspaceId', '==', workspaceId));
  const snapshot = await getDocs(suppliersQuery);
  const suppliers = snapshot.docs.map((supplierSnapshot) => ({
    id: supplierSnapshot.id,
    ...supplierSnapshot.data(),
  }));

  return {
    suppliersById: new Map(suppliers.map((supplier) => [supplier.id, supplier])),
    supplierIdsByName: new Map(suppliers.map((supplier) => [normalizeName(supplier.name), supplier.id])),
  };
}

async function getInventoryDirectory(workspaceId) {
  const inventoryQuery = query(collection(db, INVENTORY_COLLECTION), where('workspaceId', '==', workspaceId));
  const snapshot = await getDocs(inventoryQuery);
  const items = snapshot.docs.map(mapSnapshotToItem);

  return {
    itemsBySku: new Map(items.map((item) => [normalizeSku(item.sku), item])),
  };
}

async function getTransactionSeedKeys(workspaceId) {
  const transactionsQuery = query(collection(db, TRANSACTIONS_COLLECTION), where('workspaceId', '==', workspaceId));
  const snapshot = await getDocs(transactionsQuery);

  return new Set(
    snapshot.docs.map((transactionSnapshot) => {
      const transaction = mapSnapshotToTransaction(transactionSnapshot);
      return createTransactionSeedKey(transaction);
    }),
  );
}

async function ensureSupplierDirectory(context, supplierNames, batch) {
  const directory = await getSupplierDirectory(context.workspaceId);
  let writesAdded = 0;

  supplierNames
    .map((supplierName) => supplierName?.trim?.())
    .filter(Boolean)
    .forEach((supplierName) => {
      const normalizedName = normalizeName(supplierName);

      if (directory.supplierIdsByName.has(normalizedName)) {
        return;
      }

      const reference = doc(collection(db, SUPPLIERS_COLLECTION));
      const payload = {
        name: supplierName,
        contactName: '',
        email: '',
        phone: '',
        leadTimeDays: 7,
        address: '',
        notes: 'Auto-created from inventory activity.',
        userId: context.userId,
        workspaceId: context.workspaceId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(reference, payload);
      directory.supplierIdsByName.set(normalizedName, reference.id);
      directory.suppliersById.set(reference.id, { id: reference.id, ...payload });
      writesAdded += 1;
    });

  return {
    directory,
    writesAdded,
  };
}

function createTransactionPayload({
  context,
  type,
  itemId,
  currentItem,
  nextItem,
  quantityDelta = 0,
  note = '',
  effectiveOn = null,
}) {
  const item = nextItem ?? currentItem ?? {};
  const previousQuantity = currentItem?.quantity ?? 0;
  const nextQuantity = nextItem?.quantity ?? 0;

  return {
    type,
    inventoryItemId: itemId,
    inventoryItemName: item.name ?? currentItem?.name ?? 'Deleted item',
    sku: item.sku ?? currentItem?.sku ?? '',
    quantityDelta,
    previousQuantity,
    nextQuantity,
    purchaseOrderNumber: item.purchaseOrderNumber ?? currentItem?.purchaseOrderNumber ?? null,
    note,
    effectiveOn: effectiveOn ?? null,
    userId: context.userId,
    workspaceId: context.workspaceId,
    ...getActorMetadata(),
    createdAt: serverTimestamp(),
  };
}

function appendTransaction(batch, payload) {
  const reference = doc(collection(db, TRANSACTIONS_COLLECTION));
  batch.set(reference, payload);
}

function buildPayloadWithLinkedSupplier(values, directory) {
  const supplierName = values.supplier?.trim?.() || '';
  const linkedSupplierId = values.supplierId?.trim?.() || directory.supplierIdsByName.get(normalizeName(supplierName)) || '';

  return formatInventoryPayload(
    {
      ...values,
      supplierId: linkedSupplierId,
      supplier: supplierName,
    },
    directory.suppliersById,
  );
}

async function commitSupplierBatchIfNeeded(context, supplierNames) {
  const batch = writeBatch(db);
  const { directory, writesAdded } = await ensureSupplierDirectory(context, supplierNames, batch);

  if (writesAdded) {
    await batch.commit();
  }

  return directory;
}

export async function getInventoryItems(context) {
  const inventoryQuery = query(collection(db, INVENTORY_COLLECTION), where('workspaceId', '==', context.workspaceId));
  const snapshot = await getDocs(inventoryQuery);

  return snapshot.docs.map(mapSnapshotToItem);
}

export async function getInventoryItemById(context, itemId) {
  const snapshot = await getDoc(doc(db, INVENTORY_COLLECTION, itemId));

  if (!snapshot.exists()) {
    return null;
  }

  const item = mapSnapshotToItem(snapshot);
  return item.workspaceId === context.workspaceId ? item : null;
}

export async function getInventoryTransactions(context) {
  const transactionsQuery = query(collection(db, TRANSACTIONS_COLLECTION), where('workspaceId', '==', context.workspaceId));
  const snapshot = await getDocs(transactionsQuery);

  return snapshot.docs
    .map(mapSnapshotToTransaction)
    .sort((left, right) => (right.createdAt?.getTime?.() ?? 0) - (left.createdAt?.getTime?.() ?? 0));
}

export async function createInventoryItem(context, values) {
  const batch = writeBatch(db);
  const { directory } = await ensureSupplierDirectory(context, [values.supplier], batch);
  const payload = buildPayloadWithLinkedSupplier(values, directory);
  const reference = doc(collection(db, INVENTORY_COLLECTION));

  batch.set(reference, {
    ...payload,
    userId: context.userId,
    workspaceId: context.workspaceId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  appendTransaction(
    batch,
    createTransactionPayload({
      context,
      type: 'create',
      itemId: reference.id,
      nextItem: payload,
      note: 'Created inventory record.',
      effectiveOn: payload.orderedOn,
    }),
  );

  await batch.commit();
}

export async function seedStarterInventory(context) {
  const batch = writeBatch(db);
  const existingSupplierDirectory = await getSupplierDirectory(context.workspaceId);
  const existingInventoryDirectory = await getInventoryDirectory(context.workspaceId);
  const existingTransactionSeedKeys = await getTransactionSeedKeys(context.workspaceId);
  const supplierRefs = new Map(existingSupplierDirectory.supplierIdsByName);
  const suppliersById = new Map(existingSupplierDirectory.suppliersById);
  const itemRefsBySku = new Map(existingInventoryDirectory.itemsBySku);
  let suppliersAdded = 0;
  let itemsAdded = 0;
  let transactionsAdded = 0;

  STARTER_SUPPLIERS.forEach((supplier) => {
    const normalizedName = normalizeName(supplier.name);

    if (supplierRefs.has(normalizedName)) {
      return;
    }

    const reference = doc(collection(db, SUPPLIERS_COLLECTION));
    supplierRefs.set(normalizedName, reference.id);
    suppliersById.set(reference.id, { id: reference.id, ...supplier });
    batch.set(reference, {
      ...supplier,
      userId: context.userId,
      workspaceId: context.workspaceId,
      createdAt: toTimestamp('2026-03-01T09:00:00Z'),
      updatedAt: toTimestamp('2026-04-15T11:00:00Z'),
    });
    suppliersAdded += 1;
  });

  const directory = {
    supplierIdsByName: supplierRefs,
    suppliersById,
  };

  STARTER_INVENTORY_ITEMS.forEach((item) => {
    const normalizedSku = normalizeSku(item.sku);

    if (itemRefsBySku.has(normalizedSku)) {
      return;
    }

    const reference = doc(collection(db, INVENTORY_COLLECTION));
    const payload = buildPayloadWithLinkedSupplier(item, directory);
    const createdAt = getItemCreatedAt(item);
    const updatedAt = getItemUpdatedAt(item);

    batch.set(reference, {
      ...payload,
      userId: context.userId,
      workspaceId: context.workspaceId,
      createdAt,
      updatedAt,
    });
    itemRefsBySku.set(normalizedSku, { id: reference.id, ...payload });
    itemsAdded += 1;
  });

  STARTER_ACTIVITY_LOG.forEach((activity) => {
    const seedKey = createTransactionSeedKey(activity);

    if (existingTransactionSeedKeys.has(seedKey)) {
      return;
    }

    const matchedItem = itemRefsBySku.get(normalizeSku(activity.sku));
    const itemId = matchedItem?.id || `archived-${normalizeSku(activity.sku || activity.inventoryItemName || 'record')}`;
    const inventoryItemName = matchedItem?.name || activity.inventoryItemName || activity.sku;
    const reference = doc(collection(db, TRANSACTIONS_COLLECTION));

    batch.set(reference, {
      type: activity.type,
      inventoryItemId: itemId,
      inventoryItemName,
      sku: activity.sku,
      quantityDelta: activity.quantityDelta,
      previousQuantity: activity.previousQuantity,
      nextQuantity: activity.nextQuantity,
      purchaseOrderNumber: activity.purchaseOrderNumber ?? null,
      note: activity.note,
      effectiveOn: activity.effectiveOn ?? null,
      userId: context.userId,
      workspaceId: context.workspaceId,
      ...getActorMetadata(),
      createdAt: toTimestamp(activity.createdAt),
    });

    transactionsAdded += 1;
  });

  if (!suppliersAdded && !itemsAdded && !transactionsAdded) {
    return {
      suppliersAdded,
      itemsAdded,
      transactionsAdded,
    };
  }

  await batch.commit();

  return {
    suppliersAdded,
    itemsAdded,
    transactionsAdded,
  };
}

export async function updateInventoryItem(context, itemId, values) {
  const directory = await commitSupplierBatchIfNeeded(context, [values.supplier]);
  const payload = buildPayloadWithLinkedSupplier(values, directory);

  await runTransaction(db, async (transaction) => {
    const reference = doc(db, INVENTORY_COLLECTION, itemId);
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists()) {
      throw new Error('Inventory item could not be found.');
    }

    const currentItem = mapSnapshotToItem(snapshot);

    if (currentItem.workspaceId !== context.workspaceId) {
      throw new Error('This inventory item is outside your workspace.');
    }

    transaction.update(reference, {
      ...payload,
      userId: context.userId,
      workspaceId: context.workspaceId,
      updatedAt: serverTimestamp(),
    });

    appendTransaction(
      transaction,
      createTransactionPayload({
        context,
        type: 'update',
        itemId,
        currentItem,
        nextItem: payload,
        quantityDelta: (payload.quantity ?? 0) - (currentItem.quantity ?? 0),
        note: 'Updated inventory details.',
        effectiveOn: payload.receivedOn ?? payload.expectedOn ?? payload.orderedOn,
      }),
    );
  });
}

export async function deleteInventoryItem(context, itemId) {
  await runTransaction(db, async (transaction) => {
    const reference = doc(db, INVENTORY_COLLECTION, itemId);
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists()) {
      return;
    }

    const currentItem = mapSnapshotToItem(snapshot);

    if (currentItem.workspaceId !== context.workspaceId) {
      throw new Error('This inventory item is outside your workspace.');
    }

    transaction.delete(reference);
    appendTransaction(
      transaction,
      createTransactionPayload({
        context,
        type: 'delete',
        itemId,
        currentItem,
        quantityDelta: -(currentItem.quantity ?? 0),
        note: 'Deleted inventory record.',
        effectiveOn: currentItem.updatedAt ? createDateKey(currentItem.updatedAt) : null,
      }),
    );
  });
}

export async function importInventoryItems(context, rows) {
  if (!rows.length) {
    throw new Error('There are no valid rows to import.');
  }

  if (rows.length > 100) {
    throw new Error('Import up to 100 rows at a time for this build.');
  }

  const batch = writeBatch(db);
  const { directory } = await ensureSupplierDirectory(
    context,
    rows.map((row) => row.supplier),
    batch,
  );
  const timestamp = serverTimestamp();

  rows.forEach((row) => {
    const payload = buildPayloadWithLinkedSupplier(row, directory);
    const reference = doc(collection(db, INVENTORY_COLLECTION));

    batch.set(reference, {
      ...payload,
      userId: context.userId,
      workspaceId: context.workspaceId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    appendTransaction(
      batch,
      createTransactionPayload({
        context,
        type: 'csv_import',
        itemId: reference.id,
        nextItem: payload,
        note: 'Imported from CSV.',
        effectiveOn: payload.expectedOn ?? payload.orderedOn,
      }),
    );
  });

  await batch.commit();
}

export async function applyInventoryTransaction(context, itemId, values) {
  await runTransaction(db, async (transaction) => {
    const reference = doc(db, INVENTORY_COLLECTION, itemId);
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists()) {
      throw new Error('Inventory item could not be found.');
    }

    const currentItem = mapSnapshotToItem(snapshot);

    if (currentItem.workspaceId !== context.workspaceId) {
      throw new Error('This inventory item is outside your workspace.');
    }

    const mode = values.mode;
    const movementQuantity = Number(values.quantity);
    const transactionDate = values.effectiveOn || createDateKey(new Date());
    let nextItem = {
      ...currentItem,
      quantity: currentItem.quantity ?? 0,
      quantityOnOrder: currentItem.quantityOnOrder ?? 0,
      orderStatus: currentItem.orderStatus ?? 'none',
      receivedOn: currentItem.receivedOn ?? null,
    };
    let quantityDelta = 0;

    if (mode === 'receive') {
      quantityDelta = movementQuantity;
      nextItem = {
        ...nextItem,
        quantity: (currentItem.quantity ?? 0) + movementQuantity,
        quantityOnOrder: Math.max((currentItem.quantityOnOrder ?? 0) - movementQuantity, 0),
        receivedOn: transactionDate,
      };
      nextItem.orderStatus = resolveOrderStatus({
        orderStatus: nextItem.quantityOnOrder > 0 ? 'partial' : 'received',
        quantityOnOrder: nextItem.quantityOnOrder,
        receivedOn: nextItem.receivedOn,
      });
    }

    if (mode === 'issue') {
      if (movementQuantity > (currentItem.quantity ?? 0)) {
        throw new Error('Issue quantity cannot exceed stock on hand.');
      }

      quantityDelta = -movementQuantity;
      nextItem = {
        ...nextItem,
        quantity: Math.max((currentItem.quantity ?? 0) - movementQuantity, 0),
      };
    }

    if (mode === 'adjust') {
      quantityDelta = movementQuantity - (currentItem.quantity ?? 0);
      nextItem = {
        ...nextItem,
        quantity: movementQuantity,
      };
    }

    nextItem.status = resolveStockStatus(nextItem.quantity, nextItem.reorderLevel);
    nextItem.orderStatus = resolveOrderStatus({
      orderStatus: nextItem.orderStatus,
      quantityOnOrder: nextItem.quantityOnOrder,
      receivedOn: nextItem.receivedOn,
    });

    transaction.update(reference, {
      quantity: nextItem.quantity,
      quantityOnOrder: nextItem.quantityOnOrder,
      orderStatus: nextItem.orderStatus,
      receivedOn: nextItem.receivedOn,
      status: nextItem.status,
      userId: context.userId,
      workspaceId: context.workspaceId,
      updatedAt: serverTimestamp(),
    });

    appendTransaction(
      transaction,
      createTransactionPayload({
        context,
        type: mode,
        itemId,
        currentItem,
        nextItem,
        quantityDelta,
        note: values.note || 'Recorded stock movement.',
        effectiveOn: transactionDate,
      }),
    );
  });
}
