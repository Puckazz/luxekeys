import { productsApi } from '@/features/shop/api/products.api';
import {
  communityShowcaseImages,
  countdownItems,
  labNotes,
} from '@/features/shop/mocks/homepage.data';
import type { HomePageContent } from '@/features/shop/types/homepage-sections.types';

const cloneCountdownItems = (items: HomePageContent['countdownItems']) => {
  return items.map((item) => ({ ...item }));
};

const cloneCommunityImages = (
  items: HomePageContent['communityShowcaseImages']
) => {
  return items.map((item) => ({ ...item }));
};

const cloneLabNotes = (items: HomePageContent['labNotes']) => {
  return items.map((item) => ({ ...item }));
};

export const homepageApi = {
  getHomepageContent: async (): Promise<HomePageContent> => {
    const featuredProducts = await productsApi.getFeaturedProducts();

    return {
      featuredProducts,
      countdownItems: cloneCountdownItems(countdownItems),
      communityShowcaseImages: cloneCommunityImages(communityShowcaseImages),
      labNotes: cloneLabNotes(labNotes),
    };
  },
};
