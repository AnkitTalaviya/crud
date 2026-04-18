import test from 'node:test';
import assert from 'node:assert/strict';
import { getFriendlyWorkspaceError } from '../src/utils/errors.js';

test('maps disabled firestore api errors to a setup message', () => {
  const message = getFriendlyWorkspaceError({
    message:
      'Cloud Firestore API has not been used in project crud-b9b80 before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=crud-b9b80 then retry.',
  });

  assert.match(message, /not enabled/i);
  assert.match(message, /Firebase Console/i);
});

test('maps missing default database errors to a setup message', () => {
  const message = getFriendlyWorkspaceError({
    message: 'The database (default) does not exist for project crud-b9b80. Visit the Firebase Console to create it.',
  });

  assert.match(message, /default Firestore database/i);
});

test('maps permission errors to a rules message', () => {
  const message = getFriendlyWorkspaceError({
    code: 'permission-denied',
    message: 'Missing or insufficient permissions.',
  });

  assert.match(message, /rules/i);
});
