import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { ProductSpecsController } from './product-specs.controller';
import { ProductSpecsService } from './product-specs.service';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

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
