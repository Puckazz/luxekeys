export const USER_ROLES = ['admin', 'customer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const canAccessAdminPanel = (role?: UserRole | null): boolean => {
  return role === 'admin';
};

export const canManageUsersCrud = (role?: UserRole | null): boolean => {
  return role === 'admin';
};
