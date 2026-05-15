import ShopProductCard from '@/features/shop/components/product-list/ShopProductCard';
import { useCartActions } from '@/features/shop/hooks/useCartActions';
import { useWishlistActions } from '@/features/shop/hooks/useWishlistActions';
import {
  getStockBadgeLabel,
  shouldShowStockBadge,
} from '@/features/shop/mappers/product-api/product-api.shared';
import { ProductStockStatus } from '@/features/shop/types';
import type { ProductCardProps } from '@/features/shop/types/product-list.types';
import { formatCurrency } from '@/lib/formatters';

const badgeVariants: Record<
  ProductStockStatus,
  'default' | 'success' | 'warning' | 'secondary'
> = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'secondary',
};

const badgeLabel: Record<ProductStockStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addItem } = useCartActions();
  const { isWished, toggleWishlist } = useWishlistActions();
  const stockBadge =
    product.badge && shouldShowStockBadge(product.badge)
      ? {
          label:
            getStockBadgeLabel(product.badge, product.stock) ??
            badgeLabel[product.badge],
          variant: badgeVariants[product.badge],
        }
      : undefined;

  const variantLabel = (() => {
    if (product.category === 'keyboards') {
      const color = product.defaultColor || 'Default';
      const sw = product.defaultSwitchName || product.switchType;
      return `${color} / ${sw}`;
    }

    return product.defaultVariantName || 'Default';
  })();

  const featuredProduct = {
    productId: product.id,
    variantId: product.defaultVariantId || product.id,
    slug: product.slug,
    name: product.name,
    subtitle: variantLabel,
    price: formatCurrency(product.price, { minimumFractionDigits: 0 }),
    originalPrice: product.originalPrice
      ? formatCurrency(product.originalPrice, { minimumFractionDigits: 0 })
      : undefined,
    discountPercentage: product.discountPercentage,
    badge: stockBadge?.label ?? null,
    image: product.image,
  };
  const isProductWished = isWished(featuredProduct);

  return (
    <ShopProductCard
      href={`/products/${product.slug}`}
      image={product.image}
      name={product.name}
      viewMode={viewMode}
      brand={product.brand}
      description={product.description}
      tags={product.tags}
      priceLabel={formatCurrency(product.price, { minimumFractionDigits: 0 })}
      originalPriceLabel={
        product.originalPrice
          ? formatCurrency(product.originalPrice, { minimumFractionDigits: 0 })
          : undefined
      }
      badge={stockBadge}
      discountPercentage={product.discountPercentage}
      wishlistToggle={{
        active: isProductWished,
        ariaLabel: `${isProductWished ? 'Remove' : 'Add'} ${product.name} ${isProductWished ? 'from' : 'to'} wishlist`,
        onClick: () => toggleWishlist(featuredProduct),
      }}
      primaryAction={{
        label:
          product.badge === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart',
        ariaLabel: `Add ${product.name} to cart`,
        className: 'flex-1',
        disabled: product.badge === 'out-of-stock',
        onClick: () => {
          addItem({
            variantId: product.defaultVariantId || product.id,
            switchOptionId: product.defaultSwitchOptionId,
            slug: product.slug,
            name: product.name,
            variantLabel,
            unitPrice: product.price,
            image: product.image,
            quantity: 1,
          });
        },
      }}
    />
  );
}
