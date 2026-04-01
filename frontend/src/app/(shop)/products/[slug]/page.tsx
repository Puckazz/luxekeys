import ProductDetailPage from '@/features/shop/components/ProductDetailPage';

type ProductDetailRoutePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailRoutePage({
  params,
}: ProductDetailRoutePageProps) {
  const { slug } = await params;

  return <ProductDetailPage slug={slug} />;
}
