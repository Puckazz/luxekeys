import ShopProductCard from '@/features/shop/components/product-list/ShopProductCard';
import { useCartStore } from '@/stores/shop/cart.store';
import { useWishlistStore } from '@/stores/shop/wishlist.store';
import { ProductCardBadge } from '@/features/shop/types';
import type { ProductCardProps } from '@/features/shop/types/product-list.types';
import { formatCurrency } from '@/lib/formatters';

const badgeVariants: Record<
  ProductCardBadge,
  'default' | 'success' | 'warning'
> = {
  new: 'default',
  'in-stock': 'success',
  limited: 'warning',
};

const badgeLabel: Record<ProductCardBadge, string> = {
  new: 'New',
  'in-stock': 'In Stock',
  limited: 'Limited',
};

const getDiscountedPrice = (price: number, discountPercentage?: number) => {
  if (!discountPercentage) {
    return price;
  }

  const discountMultiplier = 1 - discountPercentage / 100;
  return Number((price * discountMultiplier).toFixed(2));
};

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);
  const discountedPrice = getDiscountedPrice(
    product.price,
    product.discountPercentage
  );
  const isWished = wishlistItems.some((item) => item.slug === product.slug);

  const featuredProduct = {
    slug: product.slug,
    name: product.name,
    subtitle: `${product.layout} / ${product.switchType}`,
    price: formatCurrency(product.price, { minimumFractionDigits: 0 }),
    discountPercentage: product.discountPercentage,
    badge: product.badge ? badgeLabel[product.badge] : null,
    image: product.image,
  };

  return (
    <ShopProductCard
      href={`/products/${product.slug}`}
      image={product.image}
      name={product.name}
      viewMode={viewMode}
      brand={product.brand}
      description={product.description}
      tags={product.tags}
      priceLabel={formatCurrency(discountedPrice, { minimumFractionDigits: 0 })}
      originalPriceLabel={
        product.discountPercentage
          ? formatCurrency(product.price, { minimumFractionDigits: 0 })
          : undefined
      }
      badge={
        product.badge
          ? {
              label: badgeLabel[product.badge],
              variant: badgeVariants[product.badge],
            }
          : undefined
      }
      discountPercentage={product.discountPercentage}
      wishlistToggle={{
        active: isWished,
        ariaLabel: `${isWished ? 'Remove' : 'Add'} ${product.name} ${isWished ? 'from' : 'to'} wishlist`,
        onClick: () => toggleWishlistItem(featuredProduct),
      }}
      primaryAction={{
        label: 'Add to Cart',
        ariaLabel: `Add ${product.name} to cart`,
        className: 'flex-1',
        onClick: () => {
          addItem({
            slug: product.slug,
            name: product.name,
            variantLabel: `${product.layout} / ${product.switchType}`,
            unitPrice: discountedPrice,
            image: product.image,
            quantity: 1,
          });
        },
      }}
    />
  );
}
