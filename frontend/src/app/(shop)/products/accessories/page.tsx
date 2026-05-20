import { renderCategoryProductsPage } from '@/app/(shop)/products/category-page.shared';

type AccessoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 60;

export default async function AccessoriesPage({
  searchParams,
}: AccessoriesPageProps) {
  return renderCategoryProductsPage('accessories', searchParams);
}
