'use client';

import { useEffect, useMemo, useState } from 'react';

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
  selectedSwitchName,
  keycapProfile,
}: {
  category: ProductDetailPageProps['product']['category'];
  selectedColor: string;
  selectedSwitch: ProductSwitchType;
  selectedSwitchName: string;
  keycapProfile?: ProductDetailPageProps['product']['keycapProfile'];
}) => {
  if (category === 'keyboards') {
    const switchLabel = selectedSwitchName || selectedSwitch;
    return `${selectedColor} / ${switchLabel}`;
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
  // Specific switch name (e.g. "Cherry MX Red") within the selected switch type
  const [selectedSwitchName, setSelectedSwitchName] = useState<string>(
    product.defaultSwitchName
  );
  const [selectedColor, setSelectedColor] = useState(product.defaultColor);
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
    setSelectedSwitch(product.defaultSwitch);
    setSelectedSwitchName(product.defaultSwitchName);
    setSelectedColor(product.defaultColor);
    setQuantity(1);
    setVisibleReviews(Math.min(2, product.reviewCount));
  }, [product]);

  const isKeyboard = product.category === 'keyboards';

  // Get the variant matching the selected color
  const currentVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find(
        (v) => !isKeyboard || (v.color ?? product.defaultColor) === selectedColor
      ) ?? product.variants[0]
    );
  }, [product.variants, product.defaultColor, selectedColor, isKeyboard]);

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
    if (isKeyboard) {
      return currentSwitchOption?.stock ?? 0;
    }
    return currentVariant?.stock ?? product.quantityLimit;
  }, [isKeyboard, currentSwitchOption, currentVariant, product.quantityLimit]);

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
    if (targetVariant?.switchOptions?.length) {
      const best =
        targetVariant.switchOptions.find((sw) => sw.isDefault && sw.stock > 0) ??
        targetVariant.switchOptions.find((sw) => sw.stock > 0) ??
        targetVariant.switchOptions[0];
      if (best) {
        setSelectedSwitch(best.switchType as ProductSwitchType);
        setSelectedSwitchName(best.name);
      }
    }
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
    if (currentStock <= 0) return;

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
        selectedSwitchName,
        keycapProfile: product.keycapProfile,
      }),
      unitPrice: discountedUnitPrice,
      image: product.image,
      quantity,
    });

    setQuantity(1);
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
        quantity={quantity}
        currentVariant={currentVariant}
        currentSwitchOption={currentSwitchOption}
        currentStock={currentStock}
        onImageSelect={setSelectedImageId}
        onSwitchSelect={handleSwitchSelect}
        onSwitchNameSelect={setSelectedSwitchName}
        onColorSelect={handleColorSelect}
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
        isLoading={productReviewsQuery.isPending}
        canLoadMore={canLoadMore}
        onLoadMore={() =>
          setVisibleReviews((current) =>
            Math.min(current + 2, product.reviewCount)
          )
        }
      />
    </div>
  );
}
