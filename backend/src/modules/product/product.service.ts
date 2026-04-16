import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedResponse, Product } from './interfaces/product.interface';

@Injectable()
export class ProductService {
  private products: Product[] = [
    {
      id: 'prod_001',
      name: 'Epomaker TH80 Pro',
      slug: 'epomaker-th80-pro',
      description: 'Wireless mechanical keyboard with RGB and hot-swap',
      price: 2390000,
      compareAtPrice: 2790000,
      brand: 'Epomaker',
      category: 'Keyboard',
      type: 'keyboard',
      images: [
        'https://placehold.co/600x400?text=TH80+1',
        'https://placehold.co/600x400?text=TH80+2',
      ],
      thumbnail: 'https://placehold.co/600x400?text=TH80',
      specs: {
        Layout: '75%',
        Battery: '4000mAh',
        RGB: 'Yes',
      },
      variants: [
        {
          id: 'var_1',
          name: 'Black - Gateron Yellow',
          price: 2390000,
          stock: 5,
          attributes: {
            color: 'Black',
            switchType: 'linear',
            layout: '75%',
          },
        },
      ],
      stock: 15,
      isActive: true,
      keyboard: {
        layout: '75%',
        keyCount: 80,
        connectivity: {
          wired: true,
          bluetooth: true,
          wireless24g: true,
        },
        battery: 4000,
        switch: {
          brand: 'Gateron',
          type: 'linear',
          hotSwappable: true,
        },
        rgb: true,
        software: 'VIA',
        mountStyle: 'gasket',
        plateMaterial: 'PC',
        caseMaterial: 'Plastic',
        features: ['knob', 'hot-swap', 'RGB'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  create(createProductDto: CreateProductDto): Product {
    const id = `prod_${Date.now()}`;
    const now = new Date().toISOString();

    const product: Product = {
      id,
      ...createProductDto,
      isActive: createProductDto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    } as Product;

    this.products.push(product);
    return product;
  }

  findAll(query: GetProductsQueryDto): PaginatedResponse<Product> {
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    const comparators: Partial<
      Record<string, (a: Product, b: Product) => number>
    > = {
      name: (a, b) => a.name.localeCompare(b.name),
      brand: (a, b) => a.brand.localeCompare(b.brand),
      category: (a, b) => a.category.localeCompare(b.category),
      price: (a, b) => a.price - b.price,
      stock: (a, b) => a.stock - b.stock,
      createdAt: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    };

    let data = [...this.products];

    if (query.search) {
      const keyword = query.search.toLowerCase();
      data = data.filter((item) => {
        return (
          item.name.toLowerCase().includes(keyword) ||
          item.slug.toLowerCase().includes(keyword) ||
          item.brand.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
        );
      });
    }

    if (query.type) {
      data = data.filter((item) => item.type === query.type);
    }

    if (query.category) {
      data = data.filter(
        (item) => item.category.toLowerCase() === query.category?.toLowerCase(),
      );
    }

    if (query.brand) {
      data = data.filter(
        (item) => item.brand.toLowerCase() === query.brand?.toLowerCase(),
      );
    }

    if (query.minPrice !== undefined) {
      data = data.filter((item) => item.price >= query.minPrice!);
    }

    if (query.maxPrice !== undefined) {
      data = data.filter((item) => item.price <= query.maxPrice!);
    }

    if (query.isActive !== undefined) {
      data = data.filter((item) => item.isActive === query.isActive);
    }

    if (query.sortBy && comparators[query.sortBy]) {
      const compare = comparators[query.sortBy]!;
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

  findOne(id: string): Product {
    const product = this.products.find((item) => item.id === id);

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto): Product {
    const index = this.products.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const updatedProduct: Product = {
      ...this.products[index],
      ...updateProductDto,
      updatedAt: new Date().toISOString(),
    } as Product;

    this.products[index] = updatedProduct;

    return updatedProduct;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
