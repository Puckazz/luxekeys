import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { ProductImagesController } from './product-images.controller.js';
import { ProductImagesService } from './product-images.service.js';
import { ProductSpecsController } from './product-specs.controller.js';
import { ProductSpecsService } from './product-specs.service.js';
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
    ProductVariantsService,
    ProductSpecsService,
    ProductImagesService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
