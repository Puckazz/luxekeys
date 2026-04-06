import { renderCategoryProductsPage } from '@/app/(shop)/products/category-page.shared';

type SwitchesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SwitchesPage({
  searchParams,
}: SwitchesPageProps) {
  return renderCategoryProductsPage('switches', searchParams);
}
