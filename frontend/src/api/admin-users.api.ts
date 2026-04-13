import {
  type ArchiveAdminUserInput,
  type AdminUser,
  type AdminUserListApiResponse,
  type AdminUserListQueryState,
  type AdminUserStatusSummary,
  type RestoreAdminUserInput,
  type UpsertAdminUserInput,
  type UpdateAdminUserRoleInput,
} from '@/features/admin/types/admin-users.types';
import { createSeedUsers } from '@/api/mocks/admin-users.mock';
import {
  canManageUsersCrud,
  canManageUsersFully,
  canStaffAssignUserRole,
  canStaffEditTargetRole,
  type UserRole,
} from '@/lib/rbac';

const MOCK_NETWORK_DELAY = 180;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const nowIso = () => {
  return new Date().toISOString();
};

const createId = (prefix: string) => {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
};

const sortUsers = (
  users: AdminUser[],
  sort: AdminUserListQueryState['sort']
): AdminUser[] => {
  const next = [...users];

  if (sort === 'name-asc') {
    next.sort((left, right) => left.name.localeCompare(right.name));
    return next;
  }

  if (sort === 'name-desc') {
    next.sort((left, right) => right.name.localeCompare(left.name));
    return next;
  }

  if (sort === 'email-asc') {
    next.sort((left, right) => left.email.localeCompare(right.email));
    return next;
  }

  next.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return next;
};

const filterUsersBySearchAndRole = (
  users: AdminUser[],
  queryState: AdminUserListQueryState
) => {
  const normalizedSearch = queryState.search.trim().toLowerCase();

  return users.filter((user) => {
    const matchSearch =
      !normalizedSearch ||
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);

    const matchRole =
      queryState.role === 'all' || user.role === queryState.role;

    return matchSearch && matchRole;
  });
};

const filterUsersByStatus = (
  users: AdminUser[],
  status: AdminUserListQueryState['status']
) => {
  if (status === 'all') {
    return users;
  }

  return users.filter((user) => user.status === status);
};

const buildUserStatusSummary = (users: AdminUser[]): AdminUserStatusSummary => {
  const initialSummary: AdminUserStatusSummary = {
    all: users.length,
    active: 0,
    inactive: 0,
    suspended: 0,
    archived: 0,
  };

  return users.reduce((summary, user) => {
    summary[user.status] += 1;
    return summary;
  }, initialSummary);
};

const paginate = (
  users: AdminUser[],
  page: number,
  pageSize: number
): Pick<AdminUserListApiResponse, 'items' | 'meta'> => {
  const totalItems = users.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: users.slice(start, start + pageSize),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

let usersStore: AdminUser[] = createSeedUsers();

const canUpdateUserRole = (
  actorRole: UserRole,
  targetRole: UserRole,
  nextRole: UserRole
) => {
  if (canManageUsersFully(actorRole)) {
    return true;
  }

  return (
    canStaffEditTargetRole(actorRole, targetRole) &&
    canStaffAssignUserRole(actorRole, nextRole)
  );
};

const assertCanManageUsersCrud = (actorRole: UserRole) => {
  if (!canManageUsersCrud(actorRole)) {
    throw new Error('You do not have permission to manage users.');
  }
};

export const adminUsersApi = {
  getUsers: async (
    queryState: AdminUserListQueryState
  ): Promise<AdminUserListApiResponse> => {
    await delay(MOCK_NETWORK_DELAY);

    const withoutArchived = usersStore.filter(
      (user) => queryState.status === 'archived' || user.status !== 'archived'
    );

    const withSearchAndRole = filterUsersBySearchAndRole(
      withoutArchived,
      queryState
    );
    const summary = buildUserStatusSummary(withSearchAndRole);
    const withStatus = filterUsersByStatus(
      withSearchAndRole,
      queryState.status
    );
    const sorted = sortUsers(withStatus, queryState.sort);
    const paginated = paginate(sorted, queryState.page, queryState.pageSize);

    return {
      ...paginated,
      summary,
    };
  },

  updateUserRole: async (
    input: UpdateAdminUserRoleInput
  ): Promise<AdminUser> => {
    await delay(MOCK_NETWORK_DELAY);

    const target = usersStore.find((user) => user.id === input.userId);

    if (!target) {
      throw new Error('User not found.');
    }

    if (!canUpdateUserRole(input.actorRole, target.role, input.nextRole)) {
      throw new Error('You do not have permission to update this role.');
    }

    const nextTarget: AdminUser = {
      ...target,
      role: input.nextRole,
      updatedAt: nowIso(),
    };

    usersStore = usersStore.map((user) =>
      user.id === input.userId ? nextTarget : user
    );

    return nextTarget;
  },

  createUser: async (input: UpsertAdminUserInput): Promise<AdminUser> => {
    await delay(MOCK_NETWORK_DELAY);
    assertCanManageUsersCrud(input.actorRole);

    const isEmailUsed = usersStore.some(
      (user) => user.email.toLowerCase() === input.email.toLowerCase()
    );

    if (isEmailUsed) {
      throw new Error('Email is already used by another account.');
    }

    const timestamp = nowIso();

    const createdUser: AdminUser = {
      id: createId('usr'),
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoginAt: timestamp,
    };

    usersStore = [createdUser, ...usersStore];
    return createdUser;
  },

  updateUser: async (input: UpsertAdminUserInput): Promise<AdminUser> => {
    await delay(MOCK_NETWORK_DELAY);
    assertCanManageUsersCrud(input.actorRole);

    if (!input.id) {
      throw new Error('User id is required for update.');
    }

    const existingUser = usersStore.find((user) => user.id === input.id);

    if (!existingUser) {
      throw new Error('User not found.');
    }

    const isEmailUsed = usersStore.some(
      (user) =>
        user.id !== input.id &&
        user.email.toLowerCase() === input.email.toLowerCase()
    );

    if (isEmailUsed) {
      throw new Error('Email is already used by another account.');
    }

    const updatedUser: AdminUser = {
      ...existingUser,
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
      updatedAt: nowIso(),
    };

    usersStore = usersStore.map((user) =>
      user.id === input.id ? updatedUser : user
    );

    return updatedUser;
  },

  softDeleteUser: async (input: ArchiveAdminUserInput): Promise<AdminUser> => {
    await delay(MOCK_NETWORK_DELAY);
    assertCanManageUsersCrud(input.actorRole);

    const existingUser = usersStore.find((user) => user.id === input.userId);

    if (!existingUser) {
      throw new Error('User not found.');
    }

    const archivedUser: AdminUser = {
      ...existingUser,
      status: 'archived',
      updatedAt: nowIso(),
    };

    usersStore = usersStore.map((user) =>
      user.id === input.userId ? archivedUser : user
    );

    return archivedUser;
  },

  restoreUser: async (input: RestoreAdminUserInput): Promise<AdminUser> => {
    await delay(MOCK_NETWORK_DELAY);
    assertCanManageUsersCrud(input.actorRole);

    const existingUser = usersStore.find((user) => user.id === input.userId);

    if (!existingUser) {
      throw new Error('User not found.');
    }

    const restoredUser: AdminUser = {
      ...existingUser,
      status: 'inactive',
      updatedAt: nowIso(),
    };

    usersStore = usersStore.map((user) =>
      user.id === input.userId ? restoredUser : user
    );

    return restoredUser;
  },
};
