import { useMutation, useQueryClient } from '@tanstack/react-query';

import { profileApi } from '@/api/profile.api';
import { PROFILE_QUERY_KEYS } from '@/features/profile/hooks/profile.query-keys';

export const useAddressMutations = () => {
  const queryClient = useQueryClient();

  const updateAddressesCache = (addresses: unknown) => {
    queryClient.setQueryData(PROFILE_QUERY_KEYS.addresses, addresses);
  };

  const upsertAddressMutation = useMutation({
    mutationFn: profileApi.upsertAddress,
    onSuccess: (addresses) => {
      updateAddressesCache(addresses);
    },
  });

  const removeAddressMutation = useMutation({
    mutationFn: profileApi.removeAddress,
    onSuccess: (addresses) => {
      updateAddressesCache(addresses);
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: profileApi.setDefaultAddress,
    onSuccess: (addresses) => {
      updateAddressesCache(addresses);
    },
  });

  return {
    upsertAddress: upsertAddressMutation.mutateAsync,
    removeAddress: removeAddressMutation.mutateAsync,
    setDefaultAddress: setDefaultAddressMutation.mutateAsync,
    isSavingAddress: upsertAddressMutation.isPending,
    isRemovingAddress: removeAddressMutation.isPending,
    isSettingDefaultAddress: setDefaultAddressMutation.isPending,
    upsertAddressError: upsertAddressMutation.error,
    removeAddressError: removeAddressMutation.error,
    setDefaultAddressError: setDefaultAddressMutation.error,
  };
};
