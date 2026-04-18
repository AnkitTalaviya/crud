export function canManageWorkspace(role) {
  return role === 'admin' || role === 'manager';
}

export function canManageRoles(role) {
  return role === 'admin';
}

export function canViewTeam(role) {
  return role === 'admin';
}

export function canApproveRequestedRole(approverRole, requestedRole) {
  if (approverRole === 'admin') {
    return ['admin', 'manager', 'viewer'].includes(requestedRole);
  }

  if (approverRole === 'manager') {
    return requestedRole === 'viewer';
  }

  return false;
}

export function requiresAccessApproval(requestedRole, workspaceId) {
  return Boolean(workspaceId?.trim?.()) && ['admin', 'manager', 'viewer'].includes(requestedRole);
}

export function canSelfBootstrapWorkspace(requestedRole, workspaceId) {
  return requestedRole === 'admin' && !workspaceId?.trim?.();
}

export function getAccessState(profile) {
  const role = profile?.role ?? null;
  const status = profile?.status ?? 'inactive';
  const isActive = status === 'active';

  return {
    role,
    status,
    isActive,
    canManageWorkspace: isActive && canManageWorkspace(role),
    canManageRoles: isActive && canManageRoles(role),
    canViewTeam: isActive && canViewTeam(role),
    isViewer: isActive && role === 'viewer',
  };
}

export function isAllowedRole(role, allowedRoles = []) {
  return !allowedRoles.length || allowedRoles.includes(role);
}
