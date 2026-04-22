import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantsService } from './product-variants.service';

@ApiTags('Product Variants')
@Controller('products/:productId/variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List variants of a product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'List of active product variants' })
  findAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productVariantsService.findAll(productId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product variant (Admin)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createProductVariantDto: CreateProductVariantDto,
  ) {
    return this.productVariantsService.create(
      productId,
      createProductVariantDto,
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product variant (Admin)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.update(
      productId,
      id,
      updateProductVariantDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product variant (Admin)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productVariantsService.remove(productId, id);
  }
}
