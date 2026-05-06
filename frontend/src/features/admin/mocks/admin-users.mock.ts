import type { AdminUser } from '@/features/admin/types/admin-users.types';

export const createSeedUsers = (): AdminUser[] => {
  const createdAt = new Date().toISOString();

  return [
    {
      id: 'usr_admin_001',
      name: 'Admin Keys',
      email: 'admin@luxekeys.io',
      role: 'admin',
      status: 'active',
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: createdAt,
    },
    {
      id: 'usr_staff_001',
      name: 'Staff Ops',
      email: 'staff@luxekeys.io',
      role: 'staff',
      status: 'active',
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: createdAt,
    },
    {
      id: 'usr_customer_001',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      status: 'active',
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: createdAt,
    },
    {
      id: 'usr_customer_002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'customer',
      status: 'inactive',
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: createdAt,
    },
    {
      id: 'usr_customer_003',
      name: 'Leo Tran',
      email: 'leo.tran@example.com',
      role: 'customer',
      status: 'suspended',
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: createdAt,
    },
  ];
};
