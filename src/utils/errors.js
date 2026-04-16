export function getFriendlyAuthError(error) {
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
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}
