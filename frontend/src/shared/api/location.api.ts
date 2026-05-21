import { apiRequest } from './http-client';

export type LocationItem = {
  code: string;
  name: string;
};

export const locationApi = {
  getStates: (country: string) => {
    return apiRequest<LocationItem[]>(
      `/addresses/states?country=${encodeURIComponent(country)}`
    );
  },
  getCities: (country: string, state: string) => {
    return apiRequest<LocationItem[]>(
      `/addresses/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`
    );
  },
};
