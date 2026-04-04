import type {
  CommunityImage,
  CountdownItem,
  FeaturedProduct,
  LabNote,
} from '@/features/shop/types';

export type HomePageContent = {
  featuredProducts: FeaturedProduct[];
  countdownItems: CountdownItem[];
  communityShowcaseImages: CommunityImage[];
  labNotes: LabNote[];
};

export type GroupBuySectionProps = {
  countdownItems: CountdownItem[];
};

export type CommunityShowcaseSectionProps = {
  images: CommunityImage[];
};

export type LabNotesSectionProps = {
  labNotes: LabNote[];
};
