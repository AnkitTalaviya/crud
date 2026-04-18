import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { canSelfBootstrapWorkspace } from '@/utils/access';
import { submitAccessRequest } from '@/services/profile.service';
import { clearSignupIntent, saveSignupIntent } from '@/utils/signupIntent';

function normalizeAuthEmail(email = '') {
  return email.trim().toLowerCase();
}

export async function signupWithEmail({ fullName, email, password, requestedRole, workspaceId }) {
  const normalizedEmail = normalizeAuthEmail(email);
  const requiresApproval = !canSelfBootstrapWorkspace(requestedRole, workspaceId);
  let credential = null;

  saveSignupIntent({
    email: normalizedEmail,
    requestedRole,
    workspaceId,
  });

  try {
    credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    await updateProfile(credential.user, { displayName: fullName });

    if (requiresApproval) {
      await submitAccessRequest(credential.user, {
        fullName,
        requestedRole,
        workspaceId,
      });
    }

    return {
      user: credential.user,
      requiresApproval,
    };
  } catch (error) {
    if (credential?.user) {
      try {
        await deleteUser(credential.user);
      } catch (cleanupError) {
        console.error('Could not clean up the partially created account', cleanupError);
      }
    }

    clearSignupIntent();
    throw error;
  }
}

export async function loginWithEmail({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, normalizeAuthEmail(email), password);
  return credential.user;
}

export async function logoutCurrentUser() {
  await signOut(auth);
}
