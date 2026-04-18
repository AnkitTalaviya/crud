import test from 'node:test';
import assert from 'node:assert/strict';
import { canApproveRequestedRole, canSelfBootstrapWorkspace, getAccessState, isAllowedRole, requiresAccessApproval } from '../src/utils/access.js';

test('admin access includes workspace and role management', () => {
  const access = getAccessState({ role: 'admin', status: 'active' });

  assert.equal(access.canManageWorkspace, true);
  assert.equal(access.canManageRoles, true);
  assert.equal(access.canViewTeam, true);
  assert.equal(access.isViewer, false);
});

test('manager access excludes role management', () => {
  const access = getAccessState({ role: 'manager', status: 'active' });

  assert.equal(access.canManageWorkspace, true);
  assert.equal(access.canManageRoles, false);
  assert.equal(access.canViewTeam, false);
});

test('inactive members lose workspace permissions', () => {
  const access = getAccessState({ role: 'admin', status: 'inactive' });

  assert.equal(access.isActive, false);
  assert.equal(access.canManageWorkspace, false);
  assert.equal(access.canManageRoles, false);
});

test('allowed role checks treat empty restrictions as open access', () => {
  assert.equal(isAllowedRole('viewer', []), true);
  assert.equal(isAllowedRole('viewer', ['admin']), false);
  assert.equal(isAllowedRole('admin', ['admin']), true);
});

test('approval chain only allows the next level up', () => {
  assert.equal(canApproveRequestedRole('admin', 'admin'), true);
  assert.equal(canApproveRequestedRole('admin', 'manager'), true);
  assert.equal(canApproveRequestedRole('manager', 'viewer'), true);
  assert.equal(canApproveRequestedRole('manager', 'manager'), false);
  assert.equal(canApproveRequestedRole('viewer', 'viewer'), false);
});

test('workspace bootstrap is only self-serve for new admin owners', () => {
  assert.equal(canSelfBootstrapWorkspace('admin', ''), true);
  assert.equal(canSelfBootstrapWorkspace('manager', ''), false);
  assert.equal(requiresAccessApproval('manager', 'workspace-1'), true);
  assert.equal(requiresAccessApproval('admin', ''), false);
});
