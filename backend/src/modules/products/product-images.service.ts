import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {} from 'multer';
import { ProductImage } from '../../generated/prisma/index.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { ProductsService } from './products.service.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findAll(productId: string): Promise<{ data: ProductImage[] }> {
    await this.productsService.findOne(productId);

    const data = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [
        { isPrimary: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return { data };
  }

  async upload(
    productId: string,
    file: Express.Multer.File,
  ): Promise<ProductImage> {
    await this.productsService.findOne(productId);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed: jpeg, png, webp, gif`,
      );
    }

    const timestamp = Date.now();
    const publicId = `luxekeys/products/${productId}/${timestamp}`;

    const uploaded = await this.cloudinary.uploadBuffer(
      file.buffer,
      `luxekeys/products/${productId}`,
      String(timestamp),
    );

    const existingCount = await this.prisma.productImage.count({
      where: { productId },
    });
    const isPrimary = existingCount === 0;

    return this.prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return tx.productImage.create({
        data: {
          productId,
          imageUrl: uploaded.secure_url,
          cloudinaryPublicId: publicId,
          isPrimary,
          sortOrder: existingCount,
        },
      });
    });
  }

  async update(
    productId: string,
    id: string,
    dto: UpdateProductImageDto,
  ): Promise<ProductImage> {
    await this.findOne(productId, id);

    if (dto.isPrimary === true) {
      return this.prisma.$transaction(async (tx) => {
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true, NOT: { id } },
          data: { isPrimary: false },
        });

        return tx.productImage.update({
          where: { id },
          data: {
            isPrimary: true,
            ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
          },
        });
      });
    }

    return this.prisma.productImage.update({
      where: { id },
      data: {
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(productId: string, id: string): Promise<ProductImage> {
    const image = await this.findOne(productId, id);

    await this.cloudinary.deleteByPublicId(image.cloudinaryPublicId ?? '');

    const removed = await this.prisma.productImage.delete({ where: { id } });

    if (image.isPrimary) {
      const next = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      if (next) {
        await this.prisma.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    return removed;
  }

  private async findOne(productId: string, id: string): Promise<ProductImage> {
    await this.productsService.findOne(productId);

    const image = await this.prisma.productImage.findFirst({
      where: { id, productId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID "${id}" not found`);
    }

    return image;
  }
}
