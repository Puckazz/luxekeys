'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import {
  ProductDetailHeroSection,
  ProductMaterialsSection,
  ProductReviewsSection,
  ProductTechnicalSpecsSection,
  ProductVideoTourSection,
} from '@/features/shop/components/product-detail';
import { useCartActions } from '@/features/shop/hooks/useCartActions';
import { useProductReviewsQuery } from '@/features/shop/hooks/useProductReviewsQuery';
import { ProductSwitchType } from '@/features/shop/types';
import type { ProductDetailPageProps } from '@/features/shop/types/product-detail.types';
import { Separator } from '@/shared/components/ui/separator';

const buildVariantLabel = ({
  type,
  currentVariantName,
  selectedColor,
  selectedSwitchName,
}: {
  type: ProductDetailPageProps['product']['type'];
  currentVariantName?: string;
  selectedColor: string;
  selectedSwitchName: string;
}) => {
  if (type === 'KEYBOARD') {
    const switchLabel = selectedSwitchName || 'Default';
    return `${selectedColor} / ${switchLabel}`;
  }

  return currentVariantName || 'Default';
};

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const { addItem } = useCartActions();
  const searchParams = useSearchParams();

  const queryColor = searchParams?.get('color');
  const querySwitchName = searchParams?.get('switch');

  const [selectedImageId, setSelectedImageId] = useState(
    product.gallery[0]?.id ?? ''
  );

  const initialColor = queryColor || product.defaultColor;
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => product.variants[0]?.id ?? ''
  );

  const [selectedSwitch, setSelectedSwitch] = useState<ProductSwitchType>(
    () => {
      if (querySwitchName && product.variants) {
        const variant =
          product.variants.find(
            (v) => (v.color ?? product.defaultColor) === initialColor
          ) ?? product.variants[0];
        const swOpt = variant?.switchOptions?.find(
          (sw) => sw.name === querySwitchName
        );
        if (swOpt) return swOpt.switchType as ProductSwitchType;
      }
      return product.defaultSwitch;
    }
  );

  const [selectedSwitchName, setSelectedSwitchName] = useState<string>(
    querySwitchName || product.defaultSwitchName
  );

  const [quantity, setQuantity] = useState(1);
  const [visibleReviews, setVisibleReviews] = useState(() => {
    return Math.min(2, product.reviewCount);
  });

  const productReviewsQuery = useProductReviewsQuery(
    product.slug,
    visibleReviews
  );

  useEffect(() => {
    const firstImageId = product.gallery[0]?.id ?? '';
    setSelectedImageId(firstImageId);

    const colorParam = searchParams?.get('color');
    const switchParam = searchParams?.get('switch');

    const resolvedColor = colorParam || product.defaultColor;
    setSelectedColor(resolvedColor);

    const resolvedVariant =
      product.variants.find((variant) => {
        if (product.type === 'KEYBOARD') {
          return (variant.color ?? product.defaultColor) === resolvedColor;
        }

        return variant.id === product.defaultVariantId;
      }) ?? product.variants[0];
    setSelectedVariantId(resolvedVariant?.id ?? '');

    if (switchParam) {
      setSelectedSwitchName(switchParam);
      if (product.variants) {
        const variant =
          product.variants.find(
            (v) => (v.color ?? product.defaultColor) === resolvedColor
          ) ?? product.variants[0];
        const swOpt = variant?.switchOptions?.find(
          (sw) => sw.name === switchParam
        );
        if (swOpt) {
          setSelectedSwitch(swOpt.switchType as ProductSwitchType);
        }
      }
    } else {
      setSelectedSwitch(product.defaultSwitch);
      setSelectedSwitchName(product.defaultSwitchName);
    }

    setQuantity(1);
    setVisibleReviews(Math.min(2, product.reviewCount));
  }, [product, searchParams]);

  const usesKeyboardSwitchOptions = product.type === 'KEYBOARD';
  const supportsColorVariants = product.category === 'keyboards';

  const currentVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    if (supportsColorVariants) {
      return (
        product.variants.find(
          (v) => (v.color ?? product.defaultColor) === selectedColor
        ) ?? product.variants[0]
      );
    }

    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      product.variants[0]
    );
  }, [
    product.variants,
    product.defaultColor,
    selectedColor,
    selectedVariantId,
    supportsColorVariants,
  ]);

  // Get the specific switch option matching selected name+type within this variant
  const currentSwitchOption = useMemo(() => {
    if (!currentVariant?.switchOptions?.length) return null;
    const matchByName = currentVariant.switchOptions.find((sw) => {
      return sw.name === selectedSwitchName;
    });

    if (matchByName) {
      return matchByName;
    }

    return (
      currentVariant.switchOptions.find((sw) => {
        return sw.switchType === selectedSwitch;
      }) ??
      currentVariant.switchOptions.find((sw) => sw.isDefault) ??
      currentVariant.switchOptions[0]
    );
  }, [currentVariant, selectedSwitchName, selectedSwitch]);

  // Stock from the specific switch option; fall back to variant-level stock for non-keyboards
  const currentStock = useMemo(() => {
    if (usesKeyboardSwitchOptions) {
      return currentSwitchOption?.stock ?? 0;
    }
    return currentVariant?.stock ?? product.quantityLimit;
  }, [
    usesKeyboardSwitchOptions,
    currentSwitchOption,
    currentVariant,
    product.quantityLimit,
  ]);

  const currentPrice =
    currentSwitchOption?.price ?? currentVariant?.price ?? product.price;
  const currentOriginalPrice =
    currentSwitchOption?.compareAtPrice &&
    currentSwitchOption.compareAtPrice > currentPrice
      ? currentSwitchOption.compareAtPrice
      : currentVariant?.compareAtPrice &&
          currentVariant.compareAtPrice > currentPrice
        ? currentVariant.compareAtPrice
        : undefined;

  // Auto-sync selectedSwitchName when switch type or variant changes
  useEffect(() => {
    if (!currentVariant?.switchOptions?.length) return;
    const selectedOptionStillExists = currentVariant.switchOptions.some(
      (sw) => sw.name === selectedSwitchName
    );

    if (selectedOptionStillExists) {
      return;
    }

    const matchByType = currentVariant.switchOptions.find(
      (sw) => sw.switchType === selectedSwitch && sw.stock > 0
    );
    const fallback =
      currentVariant.switchOptions.find((sw) => sw.isDefault) ??
      currentVariant.switchOptions[0];
    const resolved = matchByType ?? fallback;
    if (resolved && resolved.name !== selectedSwitchName) {
      setSelectedSwitchName(resolved.name);
    }
  }, [currentVariant, selectedSwitch, selectedSwitchName]);

  // When color changes: auto-select the best switch for that color
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const targetVariant = product.variants?.find(
      (v) => (v.color ?? product.defaultColor) === color
    );
    setSelectedVariantId(targetVariant?.id ?? '');
    if (targetVariant?.switchOptions?.length) {
      const best =
        targetVariant.switchOptions.find(
          (sw) => sw.isDefault && sw.stock > 0
        ) ??
        targetVariant.switchOptions.find((sw) => sw.stock > 0) ??
        targetVariant.switchOptions[0];
      if (best) {
        setSelectedSwitch(best.switchType as ProductSwitchType);
        setSelectedSwitchName(best.name);
      }
    }
    setQuantity(1);
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  // When switch TYPE changes: auto-select the best switch NAME of that type
  const handleSwitchSelect = (switchType: ProductSwitchType) => {
    setSelectedSwitch(switchType);
    if (currentVariant?.switchOptions?.length) {
      const best =
        currentVariant.switchOptions.find(
          (sw) => sw.switchType === switchType && sw.stock > 0
        ) ??
        currentVariant.switchOptions.find((sw) => sw.switchType === switchType);
      if (best) setSelectedSwitchName(best.name);
    }
  };

  const increaseQuantity = () => {
    setQuantity((previous) => {
      if (currentStock <= 0) return 1;
      return Math.min(previous + 1, currentStock);
    });
  };

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(previous - 1, 1));
  };

  const handleAddToCart = () => {
    if (currentStock <= 0 || !currentVariant) return;

    addItem({
      variantId: currentVariant.id,
      switchOptionId: currentSwitchOption?.id,
      slug: product.slug,
      name: product.name,
      variantLabel: buildVariantLabel({
        type: product.type,
        currentVariantName: currentVariant.name,
        selectedColor,
        selectedSwitchName,
      }),
      unitPrice: currentPrice,
      image: product.image,
      quantity,
    });
  };

  const handleLoadMore = () => {
    setVisibleReviews((prev) => Math.min(prev + 3, product.reviewCount));
  };

  const reviews = productReviewsQuery.data ?? [];
  const canLoadMore = visibleReviews < product.reviewCount;

  return (
    <div className="bg-background">
      <ProductDetailHeroSection
        product={product}
        selectedImageId={selectedImageId}
        selectedSwitch={selectedSwitch}
        selectedSwitchName={selectedSwitchName}
        selectedColor={selectedColor}
        selectedVariantId={selectedVariantId}
        quantity={quantity}
        currentVariant={currentVariant}
        currentSwitchOption={currentSwitchOption}
        currentStock={currentStock}
        currentPrice={currentPrice}
        currentOriginalPrice={currentOriginalPrice}
        onImageSelect={setSelectedImageId}
        onSwitchSelect={handleSwitchSelect}
        onSwitchNameSelect={setSelectedSwitchName}
        onColorSelect={handleColorSelect}
        onVariantSelect={handleVariantSelect}
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

      {product.materialShowcase ? (
        <ProductMaterialsSection showcase={product.materialShowcase} />
      ) : null}

      {product.videoTour ? (
        <ProductVideoTourSection videoTour={product.videoTour} />
      ) : null}

      <ProductReviewsSection
        heading={product.reviewsHeading}
        reviews={reviews}
        isLoading={productReviewsQuery.isPending && product.reviewCount > 0}
        canLoadMore={canLoadMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
