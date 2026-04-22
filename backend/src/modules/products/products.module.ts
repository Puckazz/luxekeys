import { Module } from '@nestjs/common';
import { ProductSpecsController } from './product-specs.controller';
import { ProductSpecsService } from './product-specs.service';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [
    ProductsController,
    ProductVariantsController,
    ProductSpecsController,
  ],
  providers: [ProductsService, ProductVariantsService, ProductSpecsService],
  exports: [ProductsService],
})
export class ProductsModule {}
