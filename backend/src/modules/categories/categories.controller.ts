import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/index.js';
import { Roles } from '../../common/decorators/index.js';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/index.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import {
  GetAdminCategoriesQueryDto,
  GetCategoriesQueryDto,
} from './dto/get-categories-query.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin)' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List categories with optional filter and pagination',
  })
  @ApiOkResponse({ description: 'Paginated list of categories' })
  findAll(@Query() query: GetCategoriesQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List categories for admin management' })
  @ApiOkResponse({ description: 'Paginated admin category list' })
  findAdminCategories(@Query() query: GetAdminCategoriesQueryDto) {
    return this.categoriesService.findAdminCategories(query);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category for admin management' })
  createAdminCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createAdminCategory(createCategoryDto);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Category tree (parent + recursive children)' })
  @ApiOkResponse({ description: 'Nested category tree' })
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Category detail with parent and children' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'List products belonging to a category' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiOkResponse({ description: 'Paginated list of products in category' })
  findProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.categoriesService.findProductsByCategory(id, page, limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category for admin management' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  updateAdminCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateAdminCategory(id, updateCategoryDto);
  }

  @Patch('admin/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore an archived category (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  restoreAdminCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.restoreAdminCategory(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a category (Admin)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a category for admin management' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  archiveAdminCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.archiveAdminCategory(id);
  }
}
