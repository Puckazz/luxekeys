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
import { CreateProductSpecDto } from './dto/create-product-spec.dto';
import { UpdateProductSpecDto } from './dto/update-product-spec.dto';
import { ProductSpecsService } from './product-specs.service';

@ApiTags('Product Specs')
@Controller('products/:productId/specs')
export class ProductSpecsController {
  constructor(private readonly productSpecsService: ProductSpecsService) {}

  @Get()
  @ApiOperation({ summary: 'List specs of a product' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'List of product specs' })
  findAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productSpecsService.findAll(productId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product spec (Admin)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createProductSpecDto: CreateProductSpecDto,
  ) {
    return this.productSpecsService.create(productId, createProductSpecDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product spec (Admin)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductSpecDto: UpdateProductSpecDto,
  ) {
    return this.productSpecsService.update(productId, id, updateProductSpecDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product spec (Admin)' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productSpecsService.remove(productId, id);
  }
}
