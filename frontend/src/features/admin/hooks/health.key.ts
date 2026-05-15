export const ADMIN_HEALTH_QUERY_KEYS = {
  all: ['admin-health'] as const,
  status: () => {
    return [...ADMIN_HEALTH_QUERY_KEYS.all, 'status'] as const;
  },
};
