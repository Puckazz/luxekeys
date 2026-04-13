export const USER_ROLES = ['admin', 'staff', 'customer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_PANEL_ROLES: readonly UserRole[] = ['admin', 'staff'];

export const canAccessAdminPanel = (role?: UserRole | null): boolean => {
  if (!role) {
    return false;
  }

  return ADMIN_PANEL_ROLES.includes(role);
};

export const canManageUsersFully = (role?: UserRole | null): boolean => {
  return role === 'admin';
};

export const canStaffEditTargetRole = (
  actorRole?: UserRole | null,
  targetRole?: UserRole | null
): boolean => {
  return actorRole === 'staff' && targetRole === 'customer';
};

export const canStaffAssignUserRole = (
  actorRole?: UserRole | null,
  nextRole?: UserRole | null
): boolean => {
  return (
    actorRole === 'staff' && (nextRole === 'customer' || nextRole === 'staff')
  );
};

export const canManageUsersCrud = (role?: UserRole | null): boolean => {
  return role === 'admin';
};
