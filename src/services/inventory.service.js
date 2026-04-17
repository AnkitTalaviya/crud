import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  updateDoc,
  where,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatInventoryPayload } from '@/utils/inventory';
import { STARTER_INVENTORY_ITEMS } from '@/utils/sampleInventory';

const INVENTORY_COLLECTION = 'inventoryItems';

function mapSnapshotToItem(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    orderedOn: data.orderedOn ?? null,
    expectedOn: data.expectedOn ?? null,
    receivedOn: data.receivedOn ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export async function getInventoryItems(userId) {
  const inventoryQuery = query(collection(db, INVENTORY_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(inventoryQuery);

  return snapshot.docs.map(mapSnapshotToItem);
}

export async function getInventoryItemById(userId, itemId) {
  const snapshot = await getDoc(doc(db, INVENTORY_COLLECTION, itemId));

  if (!snapshot.exists()) {
    return null;
  }

  const item = mapSnapshotToItem(snapshot);
  return item.userId === userId ? item : null;
}

export async function createInventoryItem(userId, values) {
  const payload = formatInventoryPayload(values);

  await addDoc(collection(db, INVENTORY_COLLECTION), {
    ...payload,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function seedStarterInventory(userId) {
  const batch = writeBatch(db);
  const timestamp = serverTimestamp();

  STARTER_INVENTORY_ITEMS.forEach((item) => {
    const reference = doc(collection(db, INVENTORY_COLLECTION));
    const payload = formatInventoryPayload(item);

    batch.set(reference, {
      ...payload,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });

  await batch.commit();
}

export async function updateInventoryItem(userId, itemId, values) {
  const payload = formatInventoryPayload(values);

  await updateDoc(doc(db, INVENTORY_COLLECTION, itemId), {
    ...payload,
    userId,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInventoryItem(itemId) {
  await deleteDoc(doc(db, INVENTORY_COLLECTION, itemId));
}
