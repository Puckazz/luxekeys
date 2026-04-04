import { homepageApi } from '@/api/homepage.api';
import {
  CommunityShowcaseSection,
  GroupBuySection,
  HeroSection,
  LabNotesSection,
  NewsletterSection,
  ProductCollectionSection,
} from '@/features/shop/components/home';

export default async function HomePage() {
  const homepageContent = await homepageApi.getHomepageContent();

  return (
    <div className="bg-background">
      <HeroSection />
      <ProductCollectionSection
        title="Featured Collections"
        description="The most sought-after boards in the enthusiast community."
        products={homepageContent.featuredProducts}
        showControls={true}
        viewAllLabel="View all"
      />
      <GroupBuySection countdownItems={homepageContent.countdownItems} />
      <CommunityShowcaseSection
        images={homepageContent.communityShowcaseImages}
      />
      <LabNotesSection labNotes={homepageContent.labNotes} />
      <NewsletterSection />
    </div>
  );
}
