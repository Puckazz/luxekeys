import type {
  ProductDetail,
  ProductDetailSpec,
  ProductMaterialShowcase,
  ProductReviewItem,
  ProductStockStatus,
  ProductSwitchType,
  ProductVideoTour,
} from '@/features/shop/types';

export type ProductDetailPageProps = {
  product: ProductDetail;
};

export type ProductDetailHeroProps = {
  product: ProductDetail;
  selectedImageId: string;
  selectedSwitch: ProductSwitchType;
  selectedSwitchName: string;
  selectedColor: string;
  selectedVariantId: string;
  quantity: number;
  currentVariant: ProductDetail['variants'][number] | null;
  currentSwitchOption: ProductDetail['variants'][number]['switchOptions'][number] | null;
  currentStock: number;
  currentPrice: number;
  currentOriginalPrice?: number;
  onImageSelect: (imageId: string) => void;
  onSwitchSelect: (switchType: ProductSwitchType) => void;
  onSwitchNameSelect: (switchName: string) => void;
  onColorSelect: (color: string) => void;
  onVariantSelect: (variantId: string) => void;
  onQuantityDecrease: () => void;
  onQuantityIncrease: () => void;
  onAddToCart: () => void;
};

export type ProductStockBadgeProps = {
  status: ProductStockStatus;
  label: string;
};

export type ProductTechnicalSpecsSectionProps = {
  heading: string;
  description: string;
  specs: ProductDetailSpec[];
};

export type ProductMaterialsSectionProps = {
  showcase: ProductMaterialShowcase;
};

export type ProductVideoTourSectionProps = {
  videoTour: ProductVideoTour;
};

export type ProductReviewsSectionProps = {
  heading: string;
  reviews: ProductReviewItem[];
  canLoadMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
};
