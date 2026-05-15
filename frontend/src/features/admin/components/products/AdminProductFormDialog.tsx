'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageUp, LoaderCircle, Star, Trash2, X } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';

import { adminProductsApi } from '@/features/admin/api/admin-products.api';
import { ADMIN_PRODUCTS_QUERY_KEYS } from '@/features/admin/hooks/products.key';
import { adminProductFormSchema } from '@/features/admin/schemas/admin-products.schema';
import type { AdminProduct, AdminProductStatus } from '@/features/admin/types';
import type {
  AdminProductFormValues,
  UpsertAdminProductInput,
} from '@/features/admin/types/admin-products.types';
import { ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE } from '@/features/admin/utils/admin-products.constants';
import {
  adminProductStatusLabelByValue,
  buildDefaultProductSpec,
  buildDefaultVariant,
  generateAdminVariantSku,
  normalizeAdminProductSpec,
} from '@/features/admin/utils/admin-products.utils';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

import { AdminProductSpecsEditor } from './AdminProductSpecsEditor';
import { AdminVariantEditor } from './AdminVariantEditor';

type AdminProductFormDialogProps = {
  mode: 'create' | 'edit';
  open: boolean;
  product: AdminProduct | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: UpsertAdminProductInput) => void;
};

type PendingProductImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const toFormValues = (product: AdminProduct | null): AdminProductFormValues => {
  if (!product) {
    return {
      name: '',
      shortDescription: '',
      productType: 'keyboards',
      brandId: '',
      catalogCategoryId: '',
      description: '',
      thumbnail: '',
      tags: '',
      isFeatured: false,
      status: 'active',
      specs: [],
      variants: [buildDefaultVariant()],
    };
  }

  const isKeyboardProduct = product.productType === 'keyboards';

  return {
    name: product.name,
    shortDescription: product.shortDescription ?? '',
    productType: product.productType,
    brandId: product.brandId ?? '',
    catalogCategoryId: product.catalogCategoryId ?? '',
    description: product.description,
    thumbnail: product.thumbnail,
    tags: product.tags.join(', '),
    isFeatured: product.isFeatured,
    status: product.status === 'archived' ? 'draft' : product.status,
    specs: product.specs.map(normalizeAdminProductSpec),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      thumbnailImageId: variant.thumbnailImageId,
      color: variant.color,
      layout: variant.layout,
      switchType: variant.switchType,
      sku: variant.sku,
      skuMode: 'manual',
      originalPrice: variant.originalPrice ?? '',
      price: variant.price,
      stock: variant.stock,
      isDefault: variant.isDefault || false,
      status: variant.status,
      switchOptions:
        variant.switchOptions.length > 0
          ? variant.switchOptions.map((option, index) => ({
              id: option.id,
              name: option.name,
              switchType: option.switchType,
              originalPrice: option.originalPrice ?? '',
              price: option.price,
              stock: option.stock,
              isDefault: option.isDefault || index === 0,
              status: option.status,
            }))
          : isKeyboardProduct
            ? buildDefaultVariant().switchOptions
            : [],
    })),
  };
};

export function AdminProductFormDialog({
  mode,
  open,
  product,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdminProductFormDialogProps) {
  const queryClient = useQueryClient();
  const [pendingImages, setPendingImages] = useState<PendingProductImage[]>([]);
  const pendingImagesRef = useRef<PendingProductImage[]>([]);
  const form = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: toFormValues(product),
  });

  const {
    control,
    register,
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState,
  } = form;
  const productType = form.watch('productType');
  const watchedProductName = useWatch({
    control,
    name: 'name',
  });
  const watchedBrandId = useWatch({
    control,
    name: 'brandId',
  });
  const watchedVariants = useWatch({
    control,
    name: 'variants',
  });
  const brandOptionsQuery = useQuery({
    queryKey: ['admin-product-brand-options'],
    queryFn: () => adminProductsApi.getBrandOptions(),
    staleTime: 60_000,
  });
  const categoryOptionsQuery = useQuery({
    queryKey: ['admin-product-category-options'],
    queryFn: () => adminProductsApi.getCategoryOptions(),
    staleTime: 60_000,
  });
  const productImagesQuery = useQuery({
    queryKey: ['admin-product-images', product?.id],
    queryFn: () => adminProductsApi.getProductImages(product!.id),
    enabled: open && Boolean(product?.id),
    staleTime: 15_000,
  });
  const productImages = productImagesQuery.data ?? product?.images ?? [];
  const selectedBrandToken = useMemo(() => {
    const brand = (brandOptionsQuery.data ?? []).find(
      (option) => option.id === watchedBrandId
    );

    return brand?.slug ?? brand?.name ?? '';
  }, [brandOptionsQuery.data, watchedBrandId]);
  const uploadProductImageMutation = useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) => {
      return adminProductsApi.uploadProductImage(productId, file);
    },
    onSuccess: (image) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-product-images', product?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });

      if (image.isPrimary) {
        setValue('thumbnail', image.imageUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
  });
  const setPrimaryProductImageMutation = useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => {
      return adminProductsApi.updateProductImage(productId, imageId, {
        isPrimary: true,
      });
    },
    onSuccess: (image) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-product-images', product?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });
      setValue('thumbnail', image.imageUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  });
  const deleteProductImageMutation = useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => {
      return adminProductsApi.deleteProductImage(productId, imageId);
    },
    onSuccess: (image) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-product-images', product?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEYS.all,
      });

      getValues('variants').forEach((variant, index) => {
        if (variant.thumbnailImageId === image.id) {
          setValue(`variants.${index}.thumbnailImageId`, undefined, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      });
    },
  });

  const variantsFieldArray = useFieldArray({
    control,
    name: 'variants',
    keyName: 'fieldId',
  });
  const specsFieldArray = useFieldArray({
    control,
    name: 'specs',
    keyName: 'fieldId',
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(product));
    }

    setPendingImages((previous) => {
      previous.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
  }, [open, product, reset]);

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl)
      );
    };
  }, []);

  const isUpdatingProductImages =
    uploadProductImageMutation.isPending ||
    setPrimaryProductImageMutation.isPending ||
    deleteProductImageMutation.isPending;

  useEffect(() => {
    const variants = getValues('variants');

    variants.forEach((variant, index) => {
      if (productType !== 'keyboards') {
        if (variant.switchOptions.length > 0) {
          setValue(`variants.${index}.switchOptions`, [], {
            shouldDirty: true,
            shouldValidate: true,
          });
        }

        return;
      }

      if (variant.switchOptions.length === 0) {
        setValue(
          `variants.${index}.switchOptions`,
          buildDefaultVariant().switchOptions,
          { shouldDirty: true, shouldValidate: true }
        );
      }
    });
  }, [getValues, productType, setValue]);

  useEffect(() => {
    (watchedVariants ?? []).forEach((variant, index) => {
      if (variant.skuMode !== 'auto') {
        return;
      }

      const generatedSku = generateAdminVariantSku({
        productName: watchedProductName ?? '',
        brandToken: selectedBrandToken,
        productType,
        color: variant.color,
        layout: variant.layout,
        switchType: variant.switchType,
      });

      if (generatedSku === variant.sku) {
        return;
      }

      setValue(`variants.${index}.sku`, generatedSku, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  }, [
    productType,
    selectedBrandToken,
    setValue,
    watchedProductName,
    watchedVariants,
  ]);

  const regenerateVariantSku = useCallback(
    (variantIndex: number) => {
      const variant = getValues(`variants.${variantIndex}`);
      const generatedSku = generateAdminVariantSku({
        productName: getValues('name'),
        brandToken: selectedBrandToken,
        productType: getValues('productType'),
        color: variant.color,
        layout: variant.layout,
        switchType: variant.switchType,
      });

      setValue(`variants.${variantIndex}.skuMode`, 'auto', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue(`variants.${variantIndex}.sku`, generatedSku, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [getValues, selectedBrandToken, setValue]
  );

  const submitHandler = (values: AdminProductFormValues) => {
    onSubmit({
      id: product?.id,
      name: values.name,
      shortDescription: values.shortDescription.trim() || undefined,
      productType: values.productType,
      brandId: values.brandId || undefined,
      catalogCategoryId: values.catalogCategoryId || undefined,
      description: values.description,
      thumbnail: values.thumbnail,
      imageFiles: pendingImages.map((image) => image.file),
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isFeatured: values.isFeatured,
      status: values.status,
      specs: values.specs.map((spec) => ({
        id: spec.id,
        groupName: spec.groupName.trim() || undefined,
        specKey: spec.specKey.trim(),
        specValue: spec.specValue.trim(),
      })),
      variants: values.variants.map((variant) => {
        const defaultSwitchOption =
          variant.switchOptions.find((option) => option.isDefault) ??
          variant.switchOptions[0];
        const variantPayload = {
          id: variant.id,
          thumbnailImageId: variant.thumbnailImageId,
          color: variant.color,
          layout: variant.layout,
          switchType: variant.switchType,
          sku: variant.sku,
          originalPrice: variant.originalPrice,
          price: variant.price,
          stock: variant.stock,
          isDefault: variant.isDefault,
          status: variant.status,
          switchOptions: variant.switchOptions,
        };

        return {
          ...variantPayload,
          switchType:
            values.productType === 'keyboards'
              ? defaultSwitchOption?.switchType || ''
              : variant.switchType,
          thumbnailImageId: variant.thumbnailImageId,
          originalPrice:
            values.productType === 'keyboards'
              ? defaultSwitchOption?.originalPrice === ''
                ? null
                : (defaultSwitchOption?.originalPrice ?? null)
              : variant.originalPrice === ''
                ? null
                : variant.originalPrice,
          price:
            values.productType === 'keyboards'
              ? (defaultSwitchOption?.price ?? variantPayload.price)
              : variantPayload.price,
          switchOptions:
            values.productType === 'keyboards'
              ? variantPayload.switchOptions.map((option) => ({
                  ...option,
                  originalPrice:
                    option.originalPrice === '' ? null : option.originalPrice,
                }))
              : [],
        };
      }),
    });
  };

  const handleProductImageUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    if (!product?.id) {
      setPendingImages((previous) => [
        ...previous,
        ...files.map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
      event.target.value = '';
      return;
    }

    for (const file of files) {
      await uploadProductImageMutation.mutateAsync({
        productId: product.id,
        file,
      });
    }

    event.target.value = '';
  };

  const removePendingImage = useCallback((id: string) => {
    setPendingImages((previous) => {
      const image = previous.find((item) => item.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return previous.filter((item) => item.id !== id);
    });
  }, []);

  const handleSetPrimaryProductImage = (imageId: string) => {
    if (!product?.id) {
      return;
    }

    setPrimaryProductImageMutation.mutate({
      productId: product.id,
      imageId,
    });
  };

  const handleDeleteProductImage = (
    event: MouseEvent<HTMLButtonElement>,
    imageId: string
  ) => {
    event.stopPropagation();

    if (!product?.id) {
      return;
    }

    deleteProductImageMutation.mutate({
      productId: product.id,
      imageId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-0 max-w-6xl flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b px-4 pt-4 pr-10 pb-3 sm:px-6 sm:pt-6">
          <DialogTitle>
            {mode === 'create' ? 'Add Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            Configure product details and variant combinations.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit(submitHandler)}
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 sm:py-6 [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Product Name</label>
                <Input
                  {...register('name')}
                  placeholder="Nova75 Wireless Keyboard"
                  className="h-10"
                />
                <p className="text-destructive text-xs">
                  {formState.errors.name?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Product Type</label>
                <Controller
                  control={control}
                  name="productType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="sm" className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          ADMIN_PRODUCT_CATEGORY_LABEL_BY_VALUE
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-destructive text-xs">
                  {formState.errors.productType?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Brand</label>
                <Controller
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(value) =>
                        field.onChange(value === '__none__' ? '' : value)
                      }
                    >
                      <SelectTrigger size="sm" className="h-10 w-full">
                        <SelectValue placeholder="No brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No brand</SelectItem>
                        {(brandOptionsQuery.data ?? []).map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Catalog Category
                </label>
                <Controller
                  control={control}
                  name="catalogCategoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(value) =>
                        field.onChange(value === '__none__' ? '' : value)
                      }
                    >
                      <SelectTrigger size="sm" className="h-10 w-full">
                        <SelectValue placeholder="No category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No category</SelectItem>
                        {(categoryOptionsQuery.data ?? []).map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold">
                  Short Description
                </label>
                <Textarea
                  {...register('shortDescription')}
                  rows={2}
                  placeholder="Compact summary for cards and quick previews."
                />
                <p className="text-destructive text-xs">
                  {formState.errors.shortDescription?.message}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold">Description</label>
                <Textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe product highlights and intended usage."
                />
                <p className="text-destructive text-xs">
                  {formState.errors.description?.message}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold">Product Images</label>
                  <div className="flex items-center gap-2">
                    {isUpdatingProductImages ? (
                      <LoaderCircle className="text-muted-foreground size-4 animate-spin" />
                    ) : null}
                    <Input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleProductImageUpload}
                      disabled={isUpdatingProductImages}
                      className="h-10 max-w-64 cursor-pointer text-xs file:mr-2"
                    />
                  </div>
                </div>

                {product?.id ? (
                  productImages.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {productImages.map((image) => (
                          <div
                            key={image.id}
                            className="border-border bg-background flex overflow-hidden rounded-md border text-left transition-colors"
                          >
                            <button
                              type="button"
                              className="hover:border-primary/50 flex min-w-0 flex-1 text-left disabled:opacity-70"
                              onClick={() =>
                                handleSetPrimaryProductImage(image.id)
                              }
                              disabled={isUpdatingProductImages}
                            >
                              <div className="relative aspect-square w-24 shrink-0 overflow-hidden">
                                <Image
                                  src={image.imageUrl}
                                  alt={image.altText ?? product.name}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold">
                                    {image.isPrimary
                                      ? 'Current thumbnail'
                                      : 'Use as thumbnail'}
                                  </p>
                                  <p className="text-muted-foreground mt-1 truncate text-[11px]">
                                    {image.imageUrl}
                                  </p>
                                </div>
                                <span className="text-muted-foreground mt-2 inline-flex items-center gap-1 text-[11px]">
                                  <Star
                                    className={`size-3 ${
                                      image.isPrimary
                                        ? 'fill-current text-amber-500'
                                        : ''
                                    }`}
                                  />
                                  {image.isPrimary
                                    ? 'Primary image'
                                    : 'Click to set primary'}
                                </span>
                              </div>
                            </button>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive self-start rounded-md p-3 transition-colors disabled:opacity-50"
                              aria-label="Delete product image"
                              title="Delete product image"
                              disabled={isUpdatingProductImages}
                              onClick={(event) =>
                                handleDeleteProductImage(event, image.id)
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-border/70 bg-background/40 rounded-md border border-dashed p-4">
                      <div className="flex items-center gap-2">
                        <ImageUp className="text-muted-foreground size-4" />
                        <p className="text-sm font-medium">
                          Upload the first product image to create the thumbnail.
                        </p>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        The primary product image now syncs automatically to the product thumbnail.
                      </p>
                    </div>
                  )
                ) : pendingImages.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pendingImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="border-border bg-background flex overflow-hidden rounded-md border text-left"
                      >
                        <div
                          className="relative aspect-square w-24 shrink-0 overflow-hidden bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${image.previewUrl}")`,
                          }}
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">
                              {index === 0 ? 'Pending thumbnail' : 'Pending image'}
                            </p>
                            <p className="text-muted-foreground mt-1 truncate text-[11px]">
                              {image.file.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive mt-2 inline-flex w-fit items-center gap-1 text-[11px]"
                            onClick={() => removePendingImage(image.id)}
                          >
                            <X className="size-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-border/70 bg-background/40 rounded-md border border-dashed p-4">
                    <p className="text-sm font-medium">
                      Upload images now and they will attach after the product is created.
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      The first uploaded image will become the product thumbnail automatically.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Thumbnail URL Override
                </label>
                <Input
                  {...register('thumbnail')}
                  placeholder="https://images.example.com/fallback-thumbnail.jpg"
                  className="h-10"
                />
                <p className="text-muted-foreground text-xs">
                  Optional. The primary product image will be used automatically when available.
                </p>
                <p className="text-destructive text-xs">
                  {formState.errors.thumbnail?.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Tags (comma separated)
                </label>
                <Input
                  {...register('tags')}
                  placeholder="wireless, gasket mount, hot swap"
                  className="h-10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Status</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="sm" className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          ['active', 'draft'] as Exclude<
                            AdminProductStatus,
                            'archived'
                          >[]
                        ).map((status) => (
                          <SelectItem key={status} value={status}>
                            {adminProductStatusLabelByValue[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-destructive text-xs">
                  {formState.errors.status?.message}
                </p>
              </div>

              <div className="flex items-center gap-3 md:col-span-1">
                <Controller
                  control={control}
                  name="isFeatured"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  )}
                />
                <div>
                  <p className="text-xs font-semibold">Featured Product</p>
                  <p className="text-muted-foreground text-xs">
                    Promote this item in featured product sections.
                  </p>
                </div>
              </div>
            </div>

            <AdminVariantEditor
              productType={productType}
              productImages={productImages}
              fields={variantsFieldArray.fields}
              control={control}
              register={register}
              setValue={setValue}
              errors={formState.errors}
              appendVariant={variantsFieldArray.append}
              removeVariant={variantsFieldArray.remove}
              onRegenerateSku={regenerateVariantSku}
              buildEmptyVariant={() => ({
                ...buildDefaultVariant(),
                switchOptions:
                  productType === 'keyboards'
                    ? buildDefaultVariant().switchOptions
                    : [],
              })}
            />

            <AdminProductSpecsEditor
              fields={specsFieldArray.fields}
              register={register}
              errors={formState.errors}
              appendSpec={specsFieldArray.append}
              removeSpec={specsFieldArray.remove}
              buildEmptySpec={buildDefaultProductSpec}
            />
          </div>

          <div className="dark:bg-input/30 flex shrink-0 items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Close
              </Button>
            </DialogClose>
            <PrimaryButton
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="h-9 w-auto min-w-36 text-sm font-semibold"
            >
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
