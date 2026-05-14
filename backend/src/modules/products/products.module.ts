import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdminProductsService } from './admin-products.service.js';
import { ProductImagesController } from './product-images.controller.js';
import { ProductImagesService } from './product-images.service.js';
import { ProductSpecsController } from './product-specs.controller.js';
import { ProductSpecsService } from './product-specs.service.js';
import { ProductUpsertService } from './product-upsert.service.js';
import { ProductVariantsController } from './product-variants.controller.js';
import { ProductVariantsService } from './product-variants.service.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [CloudinaryModule],
  controllers: [
    ProductsController,
    ProductVariantsController,
    ProductSpecsController,
    ProductImagesController,
  ],
  providers: [
    ProductsService,
    AdminProductsService,
    AdminInventoryService,
    ProductUpsertService,
    ProductVariantsService,
    ProductSpecsService,
    ProductImagesService,
  ],
  exports: [ProductsService, AdminProductsService, AdminInventoryService],
})
export class ProductsModule {}
