import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { productsApi } from '@/api/products.api';
import ProductDetailPage from '@/features/shop/components/ProductDetailPage';

type ProductDetailRoutePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getProductBySlug = async (slug: string) => {
  try {
    return await productsApi.getProductDetailBySlug(slug);
  } catch {
    return null;
  }
};

export async function generateMetadata({
  params,
}: ProductDetailRoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | LuxeKeys',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: `${product.name} | LuxeKeys`,
    description: product.description,
    openGraph: {
      title: `${product.name} | LuxeKeys`,
      description: product.description,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailRoutePage({
  params,
}: ProductDetailRoutePageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailPage product={product} />;
}
