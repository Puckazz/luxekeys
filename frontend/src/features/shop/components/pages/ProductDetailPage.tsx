'use client';

import { useEffect, useState } from 'react';

import {
  ProductDetailHeroSection,
  ProductMaterialsSection,
  ProductReviewsSection,
  ProductTechnicalSpecsSection,
  ProductVideoTourSection,
} from '@/features/shop/components/product-detail';
import { useCartStore } from '@/stores/shop/cart.store';
import { useProductReviewsQuery } from '@/features/shop/hooks/useProductReviewsQuery';
import { ProductSwitchType } from '@/features/shop/types';
import type { ProductDetailPageProps } from '@/features/shop/types/product-detail.types';
import { Separator } from '@/shared/components/ui/separator';

const calculateDiscountedPrice = (
  price: number,
  discountPercentage?: number
) => {
  if (!discountPercentage || discountPercentage <= 0) {
    return price;
  }

  return Number((price * (1 - discountPercentage / 100)).toFixed(2));
};

const buildVariantLabel = ({
  category,
  selectedColor,
  selectedSwitch,
  keycapProfile,
}: {
  category: ProductDetailPageProps['product']['category'];
  selectedColor: string;
  selectedSwitch: ProductSwitchType;
  keycapProfile?: ProductDetailPageProps['product']['keycapProfile'];
}) => {
  if (category === 'keyboards') {
    return `${selectedColor} / ${selectedSwitch}`;
  }

  if (category === 'keycaps' && keycapProfile) {
    return `${keycapProfile} Profile`;
  }

  if (category === 'switches') {
    return selectedSwitch;
  }

  return 'Default';
};

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedImageId, setSelectedImageId] = useState(
    product.gallery[0]?.id ?? ''
  );
  const [selectedSwitch, setSelectedSwitch] = useState<ProductSwitchType>(
    product.defaultSwitch
  );
  const [selectedColor, setSelectedColor] = useState(product.defaultColor);
  const [quantity, setQuantity] = useState(1);
  const [visibleReviews, setVisibleReviews] = useState(() => {
    return Math.min(2, product.reviews.length);
  });

  const productReviewsQuery = useProductReviewsQuery(
    product.slug,
    visibleReviews
  );

  useEffect(() => {
    const firstImageId = product.gallery[0]?.id ?? '';
    setSelectedImageId(firstImageId);
    setSelectedSwitch(product.defaultSwitch);
    setSelectedColor(product.defaultColor);
    setQuantity(1);
    setVisibleReviews(Math.min(2, product.reviews.length));
  }, [product]);

  const increaseQuantity = () => {
    setQuantity((previous) => previous + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(previous - 1, 1));
  };

  const handleAddToCart = () => {
    const discountedUnitPrice = calculateDiscountedPrice(
      product.price,
      product.discountPercentage
    );

    addItem({
      slug: product.slug,
      name: product.name,
      variantLabel: buildVariantLabel({
        category: product.category,
        selectedColor,
        selectedSwitch,
        keycapProfile: product.keycapProfile,
      }),
      unitPrice: discountedUnitPrice,
      image: product.image,
      quantity,
    });

    setQuantity(1);
  };

  const reviews = productReviewsQuery.data ?? [];
  const canLoadMore = visibleReviews < product.reviews.length;

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
        onAddToCart={handleAddToCart}
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
        reviews={reviews}
        isLoading={productReviewsQuery.isPending}
        canLoadMore={canLoadMore}
        onLoadMore={() => setVisibleReviews((current) => current + 2)}
      />
    </div>
  );
}
