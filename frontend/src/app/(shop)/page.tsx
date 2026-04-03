import CommunityShowcaseSection from '@/features/shop/components/CommunityShowcaseSection';
import ProductCollectionSection from '@/features/shop/components/ProductCollectionSection';
import GroupBuySection from '@/features/shop/components/GroupBuySection';
import HeroSection from '@/features/shop/components/HeroSection';
import LabNotesSection from '@/features/shop/components/LabNotesSection';
import NewsletterSection from '@/features/shop/components/NewsletterSection';
import { featuredProducts } from '@/features/shop/mocks/homepage.data';

export default function HomePage() {
  return (
    <div className="bg-background">
      <HeroSection />
      <ProductCollectionSection
        title="Featured Collections"
        description="The most sought-after boards in the enthusiast community."
        products={featuredProducts}
        showControls={true}
        viewAllLabel="View all"
      />
      <GroupBuySection />
      <CommunityShowcaseSection />
      <LabNotesSection />
      <NewsletterSection />
    </div>
  );
}
