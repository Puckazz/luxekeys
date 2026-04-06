'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, MapPin, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  CheckoutOrderSummaryCard,
  CheckoutStepper,
} from '@/features/shop/components/checkout';
import { checkoutSchema } from '@/features/shop/schemas/checkout.schema';
import { useCheckoutFlow } from '@/features/shop/hooks/useCheckoutFlow';
import { useCheckoutStore } from '@/stores/shop/checkout.store';
import { useCartStore } from '@/stores/shop/cart.store';
import { useCartSync } from '@/features/shop/hooks/useCartSync';
import type { CheckoutFormValues } from '@/features/shop/types/checkout.types';
import {
  buildOrderPricing,
  calculateSubtotal,
  normalizePromoCode,
  resolveDiscountRate,
} from '@/features/shop/utils/checkout.utils';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import AddressFormFields from '@/shared/components/forms/AddressFormFields';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Textarea } from '@/shared/components/ui/textarea';

const cityOptions = ['Ho Chi Minh City', 'Ha Noi', 'Da Nang'];
const districtOptionsByCity: Record<string, string[]> = {
  'Ho Chi Minh City': [
    'District 1',
    'District 2',
    'District 3',
    'Thu Duc City',
  ],
  'Ha Noi': ['Ba Dinh', 'Dong Da', 'Cau Giay', 'Hoan Kiem'],
  'Da Nang': ['Hai Chau', 'Thanh Khe', 'Son Tra'],
};

const paymentBadgeClassByMethod: Record<
  CheckoutFormValues['paymentMethod'],
  string
> = {
  'vnpay-qr': 'bg-white text-[#0A3D91]',
  momo: 'bg-[#B5007A] text-white',
  zalopay: 'bg-[#138DFF] text-white',
  card: 'bg-[#3C4E6A] text-white',
  cod: 'bg-[#2B3E5A] text-white',
};

const renderPaymentBadgeLabel = (
  paymentMethod: CheckoutFormValues['paymentMethod']
) => {
  if (paymentMethod === 'vnpay-qr') {
    return (
      <>
        <span>VN</span>
        <span className="text-[#ED3C2F]">PAY</span>
      </>
    );
  }

  if (paymentMethod === 'momo') {
    return 'MoMo';
  }

  if (paymentMethod === 'card') {
    return <CreditCard className="size-5" />;
  }

  return <Wallet className="size-5" />;
};

const toCardNumber = (raw: string) => {
  const digits = raw.replace(/\D+/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const toExpiry = (raw: string) => {
  const digits = raw.replace(/\D+/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
};

const toCvc = (raw: string) => {
  return raw.replace(/\D+/g, '').slice(0, 4);
};

const getDefaultValues = (
  draft: ReturnType<typeof useCheckoutStore.getState>['draft']
): CheckoutFormValues => {
  if (!draft) {
    return {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '0912 345 678',
      streetAddress: '123 Nguyen Hue Street',
      city: 'Ho Chi Minh City',
      district: 'District 1',
      shippingMethod: 'standard',
      paymentMethod: 'vnpay-qr',
      cardNumber: '',
      expiry: '',
      cvc: '',
      promoCode: '',
      notes: '',
    };
  }

  return {
    fullName: draft.shippingAddress.fullName,
    email: draft.shippingAddress.email,
    phone: draft.shippingAddress.phone,
    streetAddress: draft.shippingAddress.streetAddress,
    city: draft.shippingAddress.city,
    district: draft.shippingAddress.district,
    shippingMethod: draft.shippingMethod,
    paymentMethod: draft.paymentMethod,
    cardNumber: '',
    expiry: '',
    cvc: '',
    promoCode: draft.promoCode ?? '',
    notes: draft.notes,
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isSyncing } = useCartSync();

  const cartHydrated = useCartStore((state) => state.hydrated);
  const checkoutHydrated = useCheckoutStore((state) => state.hydrated);
  const cartItems = useCartStore((state) => state.items);
  const draft = useCheckoutStore((state) => state.draft);

  const {
    submitCheckout,
    confirmCheckout,
    shippingOptions,
    paymentOptions,
    isSubmittingCheckout,
    checkoutSubmitError,
    isConfirmingCheckout,
    checkoutConfirmError,
  } = useCheckoutFlow();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: getDefaultValues(draft),
  });

  const [promoInputValue, setPromoInputValue] = useState(
    getDefaultValues(draft).promoCode
  );
  const [hasPaymentInteraction, setHasPaymentInteraction] = useState(false);

  useEffect(() => {
    if (!checkoutHydrated) {
      return;
    }

    const nextDefaultValues = getDefaultValues(draft);
    reset(nextDefaultValues);
    setPromoInputValue(nextDefaultValues.promoCode);
  }, [checkoutHydrated, draft, reset]);

  const selectedCity = watch('city');
  const selectedShippingMethod = watch('shippingMethod');
  const selectedPromoCode = watch('promoCode');
  const selectedPaymentMethod = watch('paymentMethod');
  const streetAddress = watch('streetAddress');
  const fullName = watch('fullName');
  const email = watch('email');
  const phone = watch('phone');
  const district = watch('district');

  const availableDistricts =
    districtOptionsByCity[selectedCity] ??
    districtOptionsByCity['Ho Chi Minh City'];

  const previewPricing = useMemo(() => {
    const subtotal = calculateSubtotal(cartItems);
    const shippingFee =
      shippingOptions.find((option) => option.id === selectedShippingMethod)
        ?.fee ?? 0;
    const normalizedPromo = normalizePromoCode(selectedPromoCode);

    return buildOrderPricing({
      subtotal,
      shippingFee,
      discountRate: resolveDiscountRate(normalizedPromo),
    });
  }, [cartItems, selectedPromoCode, selectedShippingMethod, shippingOptions]);

  const hasValidatedAddress =
    streetAddress.trim().length > 5 && !errors.streetAddress;
  const isCardPayment = selectedPaymentMethod === 'card';

  const isShippingReady =
    fullName.trim().length > 1 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    streetAddress.trim().length > 5 &&
    selectedCity.trim().length > 0 &&
    district.trim().length > 0 &&
    selectedShippingMethod.trim().length > 0;

  const checkoutStep =
    hasPaymentInteraction && isShippingReady ? 'payment' : 'shipping';

  const onSubmit = async (values: CheckoutFormValues) => {
    const reviewData = await submitCheckout(values);
    await confirmCheckout(reviewData);
    router.push('/checkout/confirmation');
  };

  if (!cartHydrated || !checkoutHydrated) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="border-border/70 bg-card/40 mt-8 rounded-2xl border p-10 text-center">
          <p className="text-foreground text-lg font-semibold">
            Your cart is empty.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Add items before proceeding to checkout.
          </p>
          <Button asChild className="mt-6">
            <Link href="/cart">Go to cart</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mt-6">
          <CheckoutStepper currentStep={checkoutStep} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
          <form
            id="checkout-form"
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {checkoutSubmitError ? (
              <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                {checkoutSubmitError.message}
              </div>
            ) : null}

            {checkoutConfirmError ? (
              <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                {checkoutConfirmError.message}
              </div>
            ) : null}

            <Card className="border-border/70 bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="text-primary size-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddressFormFields
                  fullNameField={register('fullName')}
                  emailField={register('email')}
                  phoneField={register('phone')}
                  streetAddressField={register('streetAddress')}
                  citySelect={{
                    value: selectedCity,
                    options: cityOptions,
                    onValueChange: (nextCity) => {
                      setValue('city', nextCity, { shouldValidate: true });
                      setValue(
                        'district',
                        districtOptionsByCity[nextCity]?.[0] ?? 'District 1',
                        { shouldValidate: true }
                      );
                    },
                    triggerClassName: 'bg-input/30 h-12 w-full rounded-md',
                  }}
                  districtSelect={{
                    value: district,
                    options: availableDistricts,
                    onValueChange: (nextDistrict) => {
                      setValue('district', nextDistrict, {
                        shouldValidate: true,
                      });
                    },
                  }}
                  messages={{
                    fullName: errors.fullName?.message,
                    email: errors.email?.message,
                    phone: errors.phone?.message,
                    streetAddress: errors.streetAddress?.message,
                    city: errors.city?.message,
                    district: errors.district?.message,
                  }}
                  showEmail
                  showEmailIcon
                  showPhoneIcon
                  showValidatedAddress={hasValidatedAddress}
                />

                <div className="space-y-2">
                  <p className="text-foreground text-sm font-semibold">
                    Shipping Method
                  </p>
                  <Controller
                    control={control}
                    name="shippingMethod"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-3 sm:grid-cols-2"
                      >
                        {shippingOptions.map((option) => (
                          <label
                            key={option.id}
                            htmlFor={`shipping-${option.id}`}
                            className={cn(
                              'border-border/80 bg-input/30 flex min-h-20 cursor-pointer items-start justify-between rounded-2xl border-2 p-5 transition-colors',
                              field.value === option.id &&
                                'border-primary bg-primary/12 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
                            )}
                          >
                            <div>
                              <p className="text-foreground text-lg leading-none font-semibold">
                                {option.label}
                              </p>
                              <p className="text-muted-foreground mt-2 text-sm">
                                {option.description}
                              </p>
                            </div>
                            <RadioGroupItem
                              id={`shipping-${option.id}`}
                              value={option.id}
                              className="mt-0.5"
                            />
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="text-primary size-4" />
                  Payment Method
                </CardTitle>
              </CardHeader>

              <CardContent
                className="space-y-4"
                onFocusCapture={() => {
                  setHasPaymentInteraction(true);
                }}
              >
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        setHasPaymentInteraction(true);
                        field.onChange(value);
                      }}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      {paymentOptions.map((option) => (
                        <label
                          key={option.id}
                          htmlFor={`payment-${option.id}`}
                          className={cn(
                            'border-border/80 bg-input/30 flex min-h-42 cursor-pointer flex-col justify-between rounded-3xl border-2 p-5 transition-colors',
                            field.value === option.id &&
                              'border-primary bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
                          )}
                        >
                          <div className="flex w-full items-start justify-between">
                            <div
                              className={cn(
                                'grid h-18 w-18 place-content-center rounded-3xl px-2 text-lg font-black tracking-tight',
                                paymentBadgeClassByMethod[option.id]
                              )}
                            >
                              <span className="inline-flex items-center justify-center gap-0.5 leading-none">
                                {renderPaymentBadgeLabel(option.id)}
                              </span>
                            </div>

                            <RadioGroupItem
                              id={`payment-${option.id}`}
                              value={option.id}
                              className="mt-0.5"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-foreground text-lg leading-none font-semibold">
                              {option.label}
                            </p>
                            <p className="text-muted-foreground mt-2 text-sm leading-snug">
                              {option.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />

                <div
                  className={cn(
                    'border-border/70 rounded-xl border p-4 transition-opacity',
                    isCardPayment ? 'opacity-100' : 'opacity-60'
                  )}
                >
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      Card Number
                    </label>
                    <Input
                      {...register('cardNumber', {
                        onChange: (event) => {
                          event.target.value = toCardNumber(event.target.value);
                        },
                      })}
                      placeholder="0000 0000 0000 0000"
                      disabled={!isCardPayment}
                    />
                    {errors.cardNumber ? (
                      <p className="text-destructive text-xs font-medium">
                        {errors.cardNumber.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Expiry Date
                      </label>
                      <Input
                        {...register('expiry', {
                          onChange: (event) => {
                            event.target.value = toExpiry(event.target.value);
                          },
                        })}
                        placeholder="MM/YY"
                        disabled={!isCardPayment}
                      />
                      {errors.expiry ? (
                        <p className="text-destructive text-xs font-medium">
                          {errors.expiry.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        CVC
                      </label>
                      <Input
                        {...register('cvc', {
                          onChange: (event) => {
                            event.target.value = toCvc(event.target.value);
                          },
                        })}
                        placeholder="***"
                        disabled={!isCardPayment}
                      />
                      {errors.cvc ? (
                        <p className="text-destructive text-xs font-medium">
                          {errors.cvc.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-foreground text-sm font-semibold">
                    Delivery Notes
                  </label>
                  <Textarea
                    {...register('notes')}
                    placeholder="Leave optional delivery notes for the courier."
                  />
                  {errors.notes ? (
                    <p className="text-destructive text-xs font-medium">
                      {errors.notes.message}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </form>

          <CheckoutOrderSummaryCard
            items={cartItems}
            pricing={previewPricing}
            actionType="submit"
            actionForm="checkout-form"
            actionLabel="Place Order"
            isActionLoading={
              isSubmittingCheckout || isConfirmingCheckout || isSyncing
            }
            promoCode={normalizePromoCode(selectedPromoCode) ?? undefined}
            promoInputValue={promoInputValue}
            onPromoInputChange={setPromoInputValue}
            onApplyPromo={() => {
              setValue('promoCode', promoInputValue.trim().toUpperCase(), {
                shouldValidate: true,
              });
            }}
            onClearPromo={() => {
              setValue('promoCode', '', { shouldValidate: true });
              setPromoInputValue('');
            }}
            legalText="By clicking 'Place Order', you authorize LuxeKeys to charge your selected payment method and agree to our Terms of Service and Privacy Policy."
          />
        </div>
      </section>
    </div>
  );
}
