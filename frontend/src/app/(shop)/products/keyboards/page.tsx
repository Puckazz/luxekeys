import { renderCategoryProductsPage } from '@/app/(shop)/products/category-page.shared';

type KeyboardsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KeyboardsPage({
  searchParams,
}: KeyboardsPageProps) {
  return renderCategoryProductsPage('keyboards', searchParams);
}
