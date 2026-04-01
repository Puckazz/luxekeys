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
  selectedColor: string;
  quantity: number;
  onImageSelect: (imageId: string) => void;
  onSwitchSelect: (switchType: ProductSwitchType) => void;
  onColorSelect: (color: string) => void;
  onQuantityDecrease: () => void;
  onQuantityIncrease: () => void;
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
