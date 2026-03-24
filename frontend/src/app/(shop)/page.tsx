import CommunityShowcaseSection from '@/features/shop/components/CommunityShowcaseSection';
import FeaturedCollectionsSection from '@/features/shop/components/FeaturedCollectionsSection';
import GroupBuySection from '@/features/shop/components/GroupBuySection';
import HeroSection from '@/features/shop/components/HeroSection';
import LabNotesSection from '@/features/shop/components/LabNotesSection';
import NewsletterSection from '@/features/shop/components/NewsletterSection';

export default function HomePage() {
  return (
    <div className="bg-background">
      <HeroSection />
      <FeaturedCollectionsSection />
      <GroupBuySection />
      <CommunityShowcaseSection />
      <LabNotesSection />
      <NewsletterSection />
    </div>
  );
}
