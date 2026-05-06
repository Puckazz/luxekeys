import {
  communityShowcaseImages,
  countdownItems,
  featuredProducts,
  labNotes,
} from '@/features/shop/mocks/homepage.data';
import type { HomePageContent } from '@/features/shop/types/homepage-sections.types';

const MOCK_DELAY = 140;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const cloneFeaturedProducts = (items: HomePageContent['featuredProducts']) => {
  return items.map((item) => ({ ...item }));
};

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
    await delay(MOCK_DELAY);

    return {
      featuredProducts: cloneFeaturedProducts(featuredProducts),
      countdownItems: cloneCountdownItems(countdownItems),
      communityShowcaseImages: cloneCommunityImages(communityShowcaseImages),
      labNotes: cloneLabNotes(labNotes),
    };
  },
};
