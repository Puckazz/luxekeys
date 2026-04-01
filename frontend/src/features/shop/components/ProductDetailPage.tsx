'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

import ProductDetailHeroSection from '@/features/shop/components/ProductDetailHeroSection';
import ProductMaterialsSection from '@/features/shop/components/ProductMaterialsSection';
import ProductReviewsSection from '@/features/shop/components/ProductReviewsSection';
import ProductTechnicalSpecsSection from '@/features/shop/components/ProductTechnicalSpecsSection';
import ProductVideoTourSection from '@/features/shop/components/ProductVideoTourSection';
import { useProductDetailQuery } from '@/features/shop/hooks/useProductDetailQuery';
import { ProductSwitchType } from '@/features/shop/types';
import type { ProductDetailPageProps } from '@/features/shop/types/product-detail.types';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Spinner } from '@/shared/components/ui/spinner';

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const productDetailQuery = useProductDetailQuery(slug);

  const [selectedImageId, setSelectedImageId] = useState('');
  const [selectedSwitch, setSelectedSwitch] =
    useState<ProductSwitchType>('Linear');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [visibleReviews, setVisibleReviews] = useState(2);

  useEffect(() => {
    if (!productDetailQuery.data) {
      return;
    }

    const firstImageId = productDetailQuery.data.gallery[0]?.id ?? '';
    setSelectedImageId(firstImageId);
    setSelectedSwitch(productDetailQuery.data.defaultSwitch);
    setSelectedColor(productDetailQuery.data.defaultColor);
    setQuantity(1);
    setVisibleReviews(2);
  }, [productDetailQuery.data]);

  const increaseQuantity = () => {
    setQuantity((previous) => previous + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(previous - 1, 1));
  };

  if (productDetailQuery.isPending) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <Spinner className="text-primary size-8" />
        <h2 className="text-foreground mt-4 text-2xl font-bold tracking-tight">
          Loading product details...
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Preparing the full configuration experience.
        </p>
      </div>
    );
  }

  if (productDetailQuery.isError || !productDetailQuery.data) {
    const errorMessage =
      productDetailQuery.error instanceof Error
        ? productDetailQuery.error.message
        : 'Something went wrong while loading this product.';
    const isNotFound = errorMessage.toLowerCase().includes('not found');

    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-foreground text-3xl font-black tracking-tight">
          {isNotFound ? 'Product not found' : 'Unable to load product'}
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
          {isNotFound
            ? 'The product may have been removed or the slug is invalid. Explore the full catalog to find alternatives.'
            : errorMessage}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/products">
              <ArrowLeft className="mr-2 size-4" />
              Back to Products
            </Link>
          </Button>
          {!isNotFound ? (
            <Button
              className="rounded-full px-5"
              onClick={() => productDetailQuery.refetch()}
            >
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const product = productDetailQuery.data;

  return (
    <div className="bg-background">
      <ProductDetailHeroSection
        product={product}
        selectedImageId={selectedImageId}
        selectedSwitch={selectedSwitch}
        selectedColor={selectedColor}
        quantity={quantity}
        onImageSelect={setSelectedImageId}
        onSwitchSelect={setSelectedSwitch}
        onColorSelect={setSelectedColor}
        onQuantityDecrease={decreaseQuantity}
        onQuantityIncrease={increaseQuantity}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Separator className="w-full" />
      </div>

      <ProductTechnicalSpecsSection
        heading={product.specsHeading}
        description={product.specsDescription}
        specs={product.technicalSpecs}
      />

      <ProductMaterialsSection showcase={product.materialShowcase} />

      <ProductVideoTourSection videoTour={product.videoTour} />

      <ProductReviewsSection
        heading={product.reviewsHeading}
        reviews={product.reviews}
        visibleCount={visibleReviews}
        onLoadMore={() => setVisibleReviews((current) => current + 2)}
      />
    </div>
  );
}
