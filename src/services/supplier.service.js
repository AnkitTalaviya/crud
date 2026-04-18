import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SUPPLIERS_COLLECTION = 'suppliers';

function mapSnapshotToSupplier(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    leadTimeDays: data.leadTimeDays ?? 0,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export async function getSuppliers(context) {
  const suppliersQuery = query(collection(db, SUPPLIERS_COLLECTION), where('workspaceId', '==', context.workspaceId));
  const snapshot = await getDocs(suppliersQuery);

  return snapshot.docs
    .map(mapSnapshotToSupplier)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function createSupplier(context, values) {
  await addDoc(collection(db, SUPPLIERS_COLLECTION), {
    ...values,
    userId: context.userId,
    workspaceId: context.workspaceId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSupplier(context, supplierId, values) {
  await updateDoc(doc(db, SUPPLIERS_COLLECTION, supplierId), {
    ...values,
    userId: context.userId,
    workspaceId: context.workspaceId,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSupplier(supplierId) {
  await deleteDoc(doc(db, SUPPLIERS_COLLECTION, supplierId));
}
