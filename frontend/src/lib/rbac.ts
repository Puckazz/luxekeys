export const USER_ROLES = ['owner', 'admin', 'customer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const canAccessAdminPanel = (role?: UserRole | null): boolean => {
  return role === 'owner' || role === 'admin';
};

export const canManageUsersCrud = (role?: UserRole | null): boolean => {
  return role === 'owner' || role === 'admin';
};

export const canManageAdminAccounts = (role?: UserRole | null): boolean => {
  return role === 'owner';
};
