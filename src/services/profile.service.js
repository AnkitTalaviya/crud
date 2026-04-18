import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { canSelfBootstrapWorkspace } from '@/utils/access';
import { REMINDER_DEFAULT_VALUES } from '@/utils/constants';
import { readSignupIntent } from '@/utils/signupIntent';

const USER_PROFILES_COLLECTION = 'userProfiles';
const WORKSPACES_COLLECTION = 'workspaces';
const WORKSPACE_INVITES_COLLECTION = 'workspaceInvites';
const ACCESS_REQUESTS_COLLECTION = 'accessRequests';
const LEGACY_COLLECTIONS = ['inventoryItems', 'suppliers', 'inventoryTransactions'];

function normalizeEmail(value = '') {
  return value.trim().toLowerCase();
}

function createWorkspaceName(user) {
  const fallbackName = user.displayName || user.email?.split('@')[0] || 'Operations';
  return `${fallbackName}'s workspace`;
}

function createDefaultProfile(user, overrides = {}) {
  return {
    userId: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Workspace member',
    email: normalizeEmail(user.email || ''),
    workspaceId: user.uid,
    role: 'admin',
    status: 'active',
    reminderPreferences: REMINDER_DEFAULT_VALUES,
    ...overrides,
  };
}

function mapProfileSnapshot(snapshot) {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    role: data.role ?? 'viewer',
    status: data.status ?? 'active',
    workspaceId: data.workspaceId ?? data.userId ?? snapshot.id,
    reminderPreferences: {
      ...REMINDER_DEFAULT_VALUES,
      ...(data.reminderPreferences ?? {}),
    },
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

function mapInviteSnapshot(snapshot) {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
    acceptedAt: data.acceptedAt?.toDate?.() ?? null,
  };
}

function mapWorkspaceSnapshot(snapshot) {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

function mapAccessRequestSnapshot(snapshot) {
  if (!snapshot.exists()) {
    return null;
  }

  return mapAccessRequestData(snapshot.id, snapshot.data());
}

function mapAccessRequestData(id, data = {}) {
  if (!data) {
    return null;
  }

  return {
    id,
    ...data,
    submittedAt: data.submittedAt?.toDate?.() ?? null,
    reviewedAt: data.reviewedAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

async function ensureWorkspaceDocument(transaction, workspaceId, user) {
  const reference = doc(db, WORKSPACES_COLLECTION, workspaceId);
  const snapshot = await transaction.get(reference);

  if (!snapshot.exists()) {
    transaction.set(reference, {
      name: createWorkspaceName(user),
      ownerUserId: workspaceId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function migrateLegacyWorkspaceData(userId, workspaceId) {
  if (!userId || !workspaceId || workspaceId !== userId) {
    return;
  }

  for (const collectionName of LEGACY_COLLECTIONS) {
    const snapshot = await getDocs(query(collection(db, collectionName), where('userId', '==', userId)));
    const docsNeedingMigration = snapshot.docs.filter((itemSnapshot) => itemSnapshot.data().workspaceId !== workspaceId);

    if (!docsNeedingMigration.length) {
      continue;
    }

    const batch = writeBatch(db);
    docsNeedingMigration.forEach((itemSnapshot) => {
      batch.update(itemSnapshot.ref, { workspaceId });
    });
    await batch.commit();
  }
}

export async function ensureUserProfile(user) {
  const result = await runTransaction(db, async (transaction) => {
    const profileReference = doc(db, USER_PROFILES_COLLECTION, user.uid);
    const profileSnapshot = await transaction.get(profileReference);
    const normalizedEmail = normalizeEmail(user.email || '');
    const signupIntent = readSignupIntent(normalizedEmail);
    const canBootstrapFromIntent =
      signupIntent && canSelfBootstrapWorkspace(signupIntent.requestedRole, signupIntent.workspaceId);

    if (!profileSnapshot.exists()) {
      let profile = null;

      if (canBootstrapFromIntent) {
        profile = createDefaultProfile(user);
      }

      const accessRequestReference = doc(db, ACCESS_REQUESTS_COLLECTION, user.uid);
      const accessRequestSnapshot = profile ? null : await transaction.get(accessRequestReference);

      if (!profile && accessRequestSnapshot?.exists()) {
        const accessRequest = accessRequestSnapshot.data();

        if (accessRequest.email === normalizedEmail) {
          if (accessRequest.status === 'approved') {
            profile = createDefaultProfile(user, {
              workspaceId: accessRequest.workspaceId,
              role: accessRequest.requestedRole,
            });
          } else {
            return {
              mode: 'request',
              request: mapAccessRequestData(user.uid, accessRequest),
            };
          }
        }
      }

      if (!profile && normalizedEmail) {
        const inviteReference = doc(db, WORKSPACE_INVITES_COLLECTION, normalizedEmail);
        const inviteSnapshot = await transaction.get(inviteReference);

        if (inviteSnapshot.exists()) {
          const invite = inviteSnapshot.data();

          if (invite.status === 'pending' && invite.email === normalizedEmail) {
            const invitedWorkspaceReference = doc(db, WORKSPACES_COLLECTION, invite.workspaceId);
            const invitedWorkspaceSnapshot = await transaction.get(invitedWorkspaceReference);

            if (!invitedWorkspaceSnapshot.exists()) {
              throw new Error('This invitation is no longer available.');
            }

            profile = createDefaultProfile(user, {
              workspaceId: invite.workspaceId,
              role: invite.role,
            });

            transaction.update(inviteReference, {
              status: 'accepted',
              acceptedByUserId: user.uid,
              acceptedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      if (!profile && signupIntent) {
        return {
          mode: 'request',
          request: {
            id: user.uid,
            userId: user.uid,
            fullName: user.displayName || user.email?.split('@')[0] || 'Workspace member',
            email: normalizedEmail,
            workspaceId: signupIntent.workspaceId,
            requestedRole: signupIntent.requestedRole,
            status: 'pending',
            reviewNote: '',
            reviewedByUserId: null,
            submittedAt: null,
            reviewedAt: null,
            updatedAt: null,
          },
        };
      }

      if (!profile) {
        throw new Error('No workspace access has been provisioned for this account yet.');
      }

      if (profile.workspaceId === user.uid) {
        await ensureWorkspaceDocument(transaction, user.uid, user);
      }

      transaction.set(profileReference, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        mode: 'profile',
        workspaceId: profile.workspaceId,
      };
    }

    const currentProfile = profileSnapshot.data();
    const resolvedWorkspaceId = currentProfile.workspaceId ?? currentProfile.userId ?? user.uid;
    const updates = {};

    if (currentProfile.displayName !== (user.displayName || user.email?.split('@')[0] || 'Workspace member')) {
      updates.displayName = user.displayName || user.email?.split('@')[0] || 'Workspace member';
    }

    if (currentProfile.email !== normalizedEmail) {
      updates.email = normalizedEmail;
    }

    if (currentProfile.workspaceId !== resolvedWorkspaceId) {
      updates.workspaceId = resolvedWorkspaceId;
    }

    if (!currentProfile.role) {
      updates.role = resolvedWorkspaceId === user.uid ? 'admin' : 'viewer';
    }

    if (!currentProfile.status) {
      updates.status = 'active';
    }

    if (!currentProfile.reminderPreferences) {
      updates.reminderPreferences = REMINDER_DEFAULT_VALUES;
    }

    if (Object.keys(updates).length) {
      transaction.update(profileReference, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }

    await ensureWorkspaceDocument(transaction, resolvedWorkspaceId, user);

    return {
      mode: 'profile',
      workspaceId: resolvedWorkspaceId,
    };
  });

  if (result.mode === 'profile') {
    try {
      await migrateLegacyWorkspaceData(user.uid, result.workspaceId);
    } catch (error) {
      if (error?.code !== 'permission-denied') {
        throw error;
      }

      // Legacy data migration can be blocked by client-side rules in shared workspaces.
      // Profile bootstrap should still succeed when no migration access is available.
      console.warn('Skipping legacy workspace migration due to Firestore permissions.', error);
    }
  }

  return result;
}

export function subscribeToUserProfile(userId, callback) {
  const reference = doc(db, USER_PROFILES_COLLECTION, userId);

  return onSnapshot(reference, (snapshot) => {
    callback(mapProfileSnapshot(snapshot));
  });
}

export async function updateUserProfile(userId, values) {
  const payload = {
    updatedAt: serverTimestamp(),
  };

  if (Object.hasOwn(values, 'displayName')) {
    payload.displayName = values.displayName?.trim?.() || 'Workspace member';
  }

  if (Object.hasOwn(values, 'reminderPreferences')) {
    payload.reminderPreferences = {
      ...REMINDER_DEFAULT_VALUES,
      ...(values.reminderPreferences ?? {}),
    };
  }

  await updateDoc(doc(db, USER_PROFILES_COLLECTION, userId), payload);
}

export async function submitAccessRequest(user, values) {
  const normalizedEmail = normalizeEmail(user.email || '');
  const accessRequestReference = doc(db, ACCESS_REQUESTS_COLLECTION, user.uid);
  const existingSnapshot = await getDoc(accessRequestReference);

  if (existingSnapshot.exists()) {
    const existingRequest = existingSnapshot.data();

    if (existingRequest.status === 'pending') {
      throw new Error('There is already a pending approval request for this account.');
    }
  }

  await setDoc(accessRequestReference, {
    userId: user.uid,
    fullName: values.fullName.trim(),
    email: normalizedEmail,
    workspaceId: values.workspaceId.trim(),
    requestedRole: values.requestedRole,
    status: 'pending',
    reviewedByUserId: null,
    reviewNote: '',
    submittedAt: existingSnapshot.exists() ? existingSnapshot.data().submittedAt ?? serverTimestamp() : serverTimestamp(),
    reviewedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function getAccessRequest(userId) {
  const snapshot = await getDoc(doc(db, ACCESS_REQUESTS_COLLECTION, userId));
  return mapAccessRequestSnapshot(snapshot);
}

export function subscribeToAccessRequest(userId, callback) {
  const reference = doc(db, ACCESS_REQUESTS_COLLECTION, userId);

  return onSnapshot(reference, (snapshot) => {
    callback(mapAccessRequestSnapshot(snapshot));
  });
}

export async function getWorkspace(workspaceId) {
  const snapshot = await getDoc(doc(db, WORKSPACES_COLLECTION, workspaceId));
  return mapWorkspaceSnapshot(snapshot);
}

export async function getWorkspaceMembers(workspaceId) {
  const snapshot = await getDocs(query(collection(db, USER_PROFILES_COLLECTION), where('workspaceId', '==', workspaceId)));

  return snapshot.docs
    .map(mapProfileSnapshot)
    .sort((left, right) => (left?.displayName || '').localeCompare(right?.displayName || ''));
}

export async function getWorkspaceAccessRequests(workspaceId, approverRole = null) {
  let requestsQuery = query(collection(db, ACCESS_REQUESTS_COLLECTION), where('workspaceId', '==', workspaceId), where('status', '==', 'pending'));

  if (approverRole === 'manager') {
    requestsQuery = query(
      collection(db, ACCESS_REQUESTS_COLLECTION),
      where('workspaceId', '==', workspaceId),
      where('status', '==', 'pending'),
      where('requestedRole', '==', 'viewer'),
    );
  }

  const snapshot = await getDocs(requestsQuery);

  return snapshot.docs
    .map(mapAccessRequestSnapshot)
    .sort((left, right) => (left?.submittedAt?.getTime?.() ?? 0) - (right?.submittedAt?.getTime?.() ?? 0));
}

export async function getWorkspaceInvites(workspaceId) {
  const snapshot = await getDocs(query(collection(db, WORKSPACE_INVITES_COLLECTION), where('workspaceId', '==', workspaceId)));

  return snapshot.docs
    .map(mapInviteSnapshot)
    .filter((invite) => invite?.status === 'pending')
    .sort((left, right) => (right?.updatedAt?.getTime?.() ?? 0) - (left?.createdAt?.getTime?.() ?? 0));
}

export async function createWorkspaceInvite(workspaceId, values) {
  const email = normalizeEmail(values.email || '');

  if (!email) {
    throw new Error('Enter a valid email address.');
  }

  const existingMembersSnapshot = await getDocs(query(collection(db, USER_PROFILES_COLLECTION), where('email', '==', email)));
  const existingProfiles = existingMembersSnapshot.docs.map(mapProfileSnapshot);
  const existingMember = existingProfiles.find((member) => member?.workspaceId === workspaceId && member?.status === 'active');
  const existingWorkspaceAccount = existingProfiles.find((member) => member?.workspaceId !== workspaceId && member?.status === 'active');

  if (existingMember) {
    throw new Error('That teammate already has access to this workspace.');
  }

  if (existingWorkspaceAccount) {
    throw new Error('That email is already assigned to another workspace.');
  }

  const inviteReference = doc(db, WORKSPACE_INVITES_COLLECTION, email);
  const inviteSnapshot = await getDoc(inviteReference);

  if (inviteSnapshot.exists()) {
    const invite = inviteSnapshot.data();

    if (invite.workspaceId !== workspaceId && invite.status === 'pending') {
      throw new Error('That email already has a pending invite for another workspace.');
    }
  }

  await setDoc(inviteReference, {
    email,
    workspaceId,
    role: values.role,
    status: 'pending',
    invitedByUserId: auth.currentUser?.uid || '',
    acceptedByUserId: null,
    acceptedAt: null,
    createdAt: inviteSnapshot.exists() ? inviteSnapshot.data().createdAt ?? serverTimestamp() : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWorkspaceInvite(email) {
  await deleteDoc(doc(db, WORKSPACE_INVITES_COLLECTION, normalizeEmail(email)));
}

export async function updateWorkspaceMemberRole(memberUserId, role) {
  await updateDoc(doc(db, USER_PROFILES_COLLECTION, memberUserId), {
    role,
    updatedAt: serverTimestamp(),
  });
}

export async function updateWorkspaceMemberStatus(memberUserId, status) {
  await updateDoc(doc(db, USER_PROFILES_COLLECTION, memberUserId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function reviewAccessRequest(userId, decision, note = '') {
  const reference = doc(db, ACCESS_REQUESTS_COLLECTION, userId);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    throw new Error('That approval request could not be found.');
  }

  const request = snapshot.data();

  if (request.status !== 'pending') {
    throw new Error('That approval request has already been reviewed.');
  }

  await updateDoc(reference, {
    status: decision,
    reviewedByUserId: auth.currentUser?.uid || '',
    reviewNote: note.trim(),
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
