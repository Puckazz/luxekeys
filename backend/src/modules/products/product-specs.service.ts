import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductSpec } from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service';
import { ProductsService } from './products.service';
import { CreateProductSpecDto } from './dto/create-product-spec.dto';
import { UpdateProductSpecDto } from './dto/update-product-spec.dto';

@Injectable()
export class ProductSpecsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(productId: string): Promise<{ data: ProductSpec[] }> {
    await this.productsService.findOne(productId);

    const data = await this.prisma.productSpec.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return { data };
  }

  async create(
    productId: string,
    dto: CreateProductSpecDto,
  ): Promise<ProductSpec> {
    await this.productsService.findOne(productId);

    return this.prisma.productSpec.create({
      data: {
        productId,
        specKey: dto.specKey,
        specValue: dto.specValue,
        groupName: dto.groupName ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(
    productId: string,
    id: string,
    dto: UpdateProductSpecDto,
  ): Promise<ProductSpec> {
    await this.findOne(productId, id);

    return this.prisma.productSpec.update({
      where: { id },
      data: {
        ...(dto.specKey !== undefined && { specKey: dto.specKey }),
        ...(dto.specValue !== undefined && { specValue: dto.specValue }),
        ...(dto.groupName !== undefined && { groupName: dto.groupName }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(productId: string, id: string): Promise<ProductSpec> {
    await this.findOne(productId, id);

    return this.prisma.productSpec.delete({ where: { id } });
  }

  private async findOne(productId: string, id: string): Promise<ProductSpec> {
    await this.productsService.findOne(productId);

    const spec = await this.prisma.productSpec.findFirst({
      where: { id, productId },
    });

    if (!spec) {
      throw new NotFoundException(`Spec with ID "${id}" not found`);
    }

    return spec;
  }
}
