import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, PaginatedResponse } from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  private categories: Category[] = [
    {
      id: 'cat_001',
      name: 'Keyboards',
      slug: 'keyboards',
      description: 'Mechanical keyboards for gaming, work, and customization.',
      productCount: 28,
      isActive: true,
      createdAt: new Date('2025-09-14T08:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-03-20T08:00:00.000Z').toISOString(),
    },
    {
      id: 'cat_002',
      name: 'Switches',
      slug: 'switches',
      description: 'Linear, tactile, clicky, and magnetic switch collections.',
      productCount: 16,
      isActive: true,
      createdAt: new Date('2025-09-14T08:10:00.000Z').toISOString(),
      updatedAt: new Date('2026-03-12T08:10:00.000Z').toISOString(),
    },
    {
      id: 'cat_003',
      name: 'Keycaps',
      slug: 'keycaps',
      description: 'PBT and ABS keycap sets with multiple profile options.',
      productCount: 13,
      isActive: true,
      createdAt: new Date('2025-09-14T08:20:00.000Z').toISOString(),
      updatedAt: new Date('2026-03-01T08:20:00.000Z').toISOString(),
    },
    {
      id: 'cat_004',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Cables, wrist rests, deskmats, and keyboard essentials.',
      productCount: 11,
      isActive: false,
      createdAt: new Date('2025-09-14T08:30:00.000Z').toISOString(),
      updatedAt: new Date('2026-02-25T08:30:00.000Z').toISOString(),
    },
  ];

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  create(createCategoryDto: CreateCategoryDto): Category {
    const now = new Date().toISOString();
    const category: Category = {
      id: `cat_${Date.now()}`,
      name: createCategoryDto.name,
      slug: createCategoryDto.slug ?? this.toSlug(createCategoryDto.name),
      description: createCategoryDto.description,
      productCount: 0,
      isActive: createCategoryDto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.categories.unshift(category);

    return category;
  }

  findAll(query: GetCategoriesQueryDto): PaginatedResponse<Category> {
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    const comparators: Record<
      'name' | 'productCount' | 'createdAt' | 'updatedAt',
      (a: Category, b: Category) => number
    > = {
      name: (a, b) => a.name.localeCompare(b.name),
      productCount: (a, b) => a.productCount - b.productCount,
      createdAt: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      updatedAt: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    };

    let data = [...this.categories];

    if (query.search) {
      const keyword = query.search.toLowerCase();
      data = data.filter((item) => {
        return (
          item.name.toLowerCase().includes(keyword) ||
          item.slug.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
        );
      });
    }

    if (query.isActive !== undefined) {
      data = data.filter((item) => item.isActive === query.isActive);
    }

    if (query.sortBy) {
      const compare = comparators[query.sortBy];

      data.sort((a, b) => {
        const result = compare(a, b);
        return sortOrder === 'desc' ? -result : result;
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = data.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  findOne(id: string): Category {
    const category = this.categories.find((item) => item.id === id);

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto): Category {
    const index = this.categories.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    const current = this.categories[index];
    const nextName = updateCategoryDto.name ?? current.name;
    const updatedCategory: Category = {
      ...current,
      ...updateCategoryDto,
      slug: updateCategoryDto.slug ?? this.toSlug(nextName),
      updatedAt: new Date().toISOString(),
    };

    this.categories[index] = updatedCategory;

    return updatedCategory;
  }

  remove(id: string): Category {
    const index = this.categories.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    const [removedCategory] = this.categories.splice(index, 1);

    return removedCategory;
  }
}
