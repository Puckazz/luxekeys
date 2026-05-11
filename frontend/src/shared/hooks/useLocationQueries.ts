import { useQuery } from '@tanstack/react-query';
import { locationApi } from '@/shared/api/location.api';

export const LOCATION_QUERY_KEYS = {
  all: ['locations'] as const,
  states: (country: string) =>
    [...LOCATION_QUERY_KEYS.all, 'states', country] as const,
  cities: (country: string, state: string) =>
    [...LOCATION_QUERY_KEYS.all, 'cities', country, state] as const,
};

export const useStatesQuery = (country?: string) => {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.states(country!),
    queryFn: () => locationApi.getStates(country!),
    enabled: !!country,
    staleTime: Infinity,
  });
};

export const useCitiesQuery = (country?: string, state?: number | string) => {
  const stateParam = state !== undefined ? String(state) : undefined;

  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.cities(country!, stateParam!),
    queryFn: () => locationApi.getCities(country!, stateParam!),
    enabled: !!country && !!stateParam,
    staleTime: Infinity,
  });
};
