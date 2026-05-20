import { renderProductsPage } from '@/app/(shop)/products/category-page.shared';

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  return renderProductsPage(searchParams);
}
