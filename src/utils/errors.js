export function getFriendlyAuthError(error) {
  const message = String(error?.message || '');

  switch (error?.code) {
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not fully configured for this project. In Firebase Console, enable Authentication and turn on the Email/Password sign-in provider.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is disabled in Firebase. Enable Email/Password under Authentication > Sign-in method.';
    case 'auth/invalid-api-key':
      return 'The Firebase API key is invalid for this app. Re-copy the web app config into your local .env file and restart the dev server.';
    case 'auth/app-not-authorized':
      return 'This app is not authorized to use Firebase Authentication. Check your Firebase web app config and authorized domains.';
    case 'auth/email-already-in-use':
      return 'That email is already in use. Try logging in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Those credentials do not match our records.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'permission-denied':
      return 'That workspace request could not be submitted. Confirm the workspace ID and make sure the latest Firestore rules have been deployed.';
    default:
      if (message.includes('Missing or insufficient permissions')) {
        return 'That workspace request could not be submitted. Confirm the workspace ID and make sure the latest Firestore rules have been deployed.';
      }

      return error?.message || 'Something went wrong. Please try again.';
  }
}

export function getFriendlyWorkspaceError(error) {
  const message = String(error?.message || '');

  if (
    message.includes('Cloud Firestore API has not been used') ||
    message.includes('firestore.googleapis.com')
  ) {
    return 'Cloud Firestore is not enabled for this Firebase project yet. Enable Firestore in Firebase Console, create the default database if prompted, wait a minute, and then try signing in again.';
  }

  if (message.includes('The database (default) does not exist')) {
    return 'Cloud Firestore has not been created for this project yet. In Firebase Console, create the default Firestore database and then try again.';
  }

  if (error?.code === 'permission-denied' || message.includes('Missing or insufficient permissions')) {
    return 'Firestore is enabled, but this app does not currently have permission to create or read the workspace profile. Check your Firestore rules and deploy the latest rules before retrying.';
  }

  if (error?.code === 'failed-precondition') {
    return 'Firestore setup is incomplete for this project. Make sure the Firestore API is enabled and the default database has been created.';
  }

  if (message.includes('No workspace access has been provisioned for this account yet.')) {
    return 'This account does not have an approved workspace yet. Ask an admin for the correct workspace ID and approval, or create a new admin workspace from the sign-up screen.';
  }

  return error?.message || 'Could not load the workspace profile.';
}
