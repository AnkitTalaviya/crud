const SIGNUP_INTENT_STORAGE_KEY = 'stockpilot.signupIntent';
const SIGNUP_INTENT_MAX_AGE_MS = 15 * 60 * 1000;

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function normalizeEmail(value = '') {
  return value.trim().toLowerCase();
}

function isValidIntent(intent) {
  return (
    intent &&
    typeof intent === 'object' &&
    typeof intent.email === 'string' &&
    typeof intent.requestedRole === 'string' &&
    typeof intent.workspaceId === 'string' &&
    typeof intent.createdAt === 'number'
  );
}

export function saveSignupIntent({ email = '', requestedRole = 'viewer', workspaceId = '' }) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    SIGNUP_INTENT_STORAGE_KEY,
    JSON.stringify({
      email: normalizeEmail(email),
      requestedRole,
      workspaceId: workspaceId.trim(),
      createdAt: Date.now(),
    }),
  );
}

export function readSignupIntent(email = '') {
  if (!canUseSessionStorage()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(SIGNUP_INTENT_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const intent = JSON.parse(rawValue);

    if (!isValidIntent(intent)) {
      clearSignupIntent();
      return null;
    }

    if (normalizeEmail(email) && intent.email !== normalizeEmail(email)) {
      return null;
    }

    if (Date.now() - intent.createdAt > SIGNUP_INTENT_MAX_AGE_MS) {
      clearSignupIntent();
      return null;
    }

    return intent;
  } catch {
    clearSignupIntent();
    return null;
  }
}

export function clearSignupIntent() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(SIGNUP_INTENT_STORAGE_KEY);
}
