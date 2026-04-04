'use client';

import Image from 'next/image';
import { X } from 'lucide-react';

import type { CheckoutOrderSummaryCardProps } from '@/features/shop/types/checkout.types';
import {
  formatCurrency,
  normalizePromoCode,
} from '@/features/shop/utils/checkout.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { cn } from '@/lib/utils';

export default function CheckoutOrderSummaryCard({
  items,
  pricing,
  actionLabel,
  actionType = 'button',
  actionForm,
  onAction,
  isActionLoading,
  disabled,
  promoCode,
  promoInputValue,
  onPromoInputChange,
  onApplyPromo,
  onClearPromo,
  legalText,
  sticky = true,
}: CheckoutOrderSummaryCardProps) {
  const normalizedDiscountInput = normalizePromoCode(promoInputValue);
  const hasAppliedDiscount =
    Boolean(promoCode) &&
    pricing.discount > 0 &&
    promoCode === normalizedDiscountInput;

  return (
    <Card
      className={cn(
        'border-border/70 bg-card/40 h-fit',
        sticky && 'lg:sticky lg:top-24'
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="gap-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="border-border/70 bg-card/70 relative size-14 shrink-0 overflow-hidden rounded-[12px] border">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground line-clamp-1 text-sm font-semibold">
                  {item.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="text-foreground text-sm font-semibold">
                {formatCurrency(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-border/70 space-y-2 border-t pt-4">
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="text-foreground font-semibold">
              {formatCurrency(pricing.subtotal)}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Discount {promoCode ? `(${promoCode})` : ''}</span>
            <span className="font-semibold text-emerald-400">
              -{formatCurrency(pricing.discount)}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Shipping</span>
            <span className="text-foreground font-semibold">
              {pricing.shipping === 0
                ? 'Free'
                : formatCurrency(pricing.shipping)}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Estimated Tax</span>
            <span className="text-foreground font-semibold">
              {formatCurrency(pricing.estimatedTax)}
            </span>
          </div>
        </div>

        <div className="border-border/70 border-t pt-4">
          <div className="flex items-center justify-between">
            <p className="text-foreground text-lg font-bold">Total</p>
            <p className="text-primary text-2xl font-black">
              {formatCurrency(pricing.total)}
            </p>
          </div>
        </div>

        {onPromoInputChange && onApplyPromo ? (
          <div className="border-border/70 bg-card/40 rounded-xl border p-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Have a discount code?
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={promoInputValue}
                onChange={(event) => onPromoInputChange(event.target.value)}
                placeholder="Enter discount code"
                className="h-10"
              />
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onApplyPromo}
                className="px-4"
                disabled={!normalizedDiscountInput || hasAppliedDiscount}
              >
                Apply
              </Button>
              {hasAppliedDiscount && onClearPromo ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear discount code"
                  onClick={onClearPromo}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <PrimaryButton
          type={actionType}
          form={actionForm}
          onClick={onAction}
          isLoading={isActionLoading}
          disabled={disabled}
        >
          {actionLabel}
        </PrimaryButton>

        {legalText ? (
          <p className="text-muted-foreground text-center text-xs leading-relaxed">
            {legalText}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
