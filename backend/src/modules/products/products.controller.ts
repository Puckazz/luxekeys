import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/index.js';
import { Roles } from '../../common/decorators/index.js';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/index.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { GetProductsQueryDto } from './dto/get-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import {
  AdminInventoryBulkUpdateDto,
  GetAdminInventoryQueryDto,
  GetAdminProductsQueryDto,
  UpsertAdminProductDto,
} from './dto/admin-product.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin)' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with filter, sort and pagination' })
  @ApiOkResponse({ description: 'Paginated list of products' })
  findAll(@Query() query: GetProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products (isFeatured = true)' })
  @ApiOkResponse({ description: 'List of featured products' })
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List products for admin catalog management' })
  @ApiOkResponse({ description: 'Paginated admin product list' })
  findAdminProducts(@Query() query: GetAdminProductsQueryDto) {
    return this.productsService.findAdminProducts(query);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product with variants (Admin)' })
  createAdminProduct(@Body() dto: UpsertAdminProductDto) {
    return this.productsService.createAdminProduct(dto);
  }

  @Get('admin/inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List product variant inventory for admin' })
  @ApiOkResponse({ description: 'Paginated admin inventory list' })
  findAdminInventory(@Query() query: GetAdminInventoryQueryDto) {
    return this.productsService.findAdminInventory(query);
  }

  @Patch('admin/inventory/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update product variant stock (Admin)' })
  bulkUpdateAdminInventoryStock(@Body() dto: AdminInventoryBulkUpdateDto) {
    return this.productsService.bulkUpdateAdminInventoryStock(dto);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product with variants (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  updateAdminProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertAdminProductDto,
  ) {
    return this.productsService.updateAdminProduct(id, dto);
  }

  @Patch('admin/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted product (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  restoreAdminProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.restoreAdminProduct(id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a product (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  archiveAdminProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.archiveAdminProduct(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiOkResponse({ description: 'Product detail' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Product detail with variants, images and specs',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a product (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
