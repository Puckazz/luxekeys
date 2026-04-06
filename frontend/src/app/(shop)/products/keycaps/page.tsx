import { renderCategoryProductsPage } from '@/app/(shop)/products/category-page.shared';

type KeycapsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KeycapsPage({ searchParams }: KeycapsPageProps) {
  return renderCategoryProductsPage('keycaps', searchParams);
}
