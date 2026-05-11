import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import {
  ADDRESS_INCLUDE,
  AddressDetail,
} from './interfaces/address.interface.js';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<AddressDetail[]> {
    return this.prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: ADDRESS_INCLUDE,
    });
  }

  async create(userId: string, dto: CreateAddressDto): Promise<AddressDetail> {
    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    return this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        streetAddress: dto.streetAddress,
        province: dto.province,
        city: dto.city,
        country: dto.country ?? 'Vietnam',
        isDefault: dto.isDefault ?? false,
      },
      include: ADDRESS_INCLUDE,
    });
  }

  async findOne(id: string, userId: string): Promise<AddressDetail> {
    const address = await this.prisma.address.findFirst({
      where: { id, deletedAt: null },
      include: ADDRESS_INCLUDE,
    });

    if (!address) {
      throw new NotFoundException(`Address with ID "${id}" not found`);
    }

    this.assertOwnership(address.userId, userId);

    return address;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressDetail> {
    await this.findOne(id, userId);

    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    return this.prisma.address.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.streetAddress !== undefined && {
          streetAddress: dto.streetAddress,
        }),
        ...(dto.province !== undefined && { province: dto.province }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
      include: ADDRESS_INCLUDE,
    });
  }

  async remove(id: string, userId: string): Promise<AddressDetail> {
    await this.findOne(id, userId);

    return this.prisma.address.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: ADDRESS_INCLUDE,
    });
  }

  async setDefault(id: string, userId: string): Promise<AddressDetail> {
    await this.findOne(id, userId);

    await this.clearDefaultAddress(userId);

    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
      include: ADDRESS_INCLUDE,
    });
  }

  async getProvinces(): Promise<{ name: string; code: number }[]> {
    const response = await fetch('https://provinces.open-api.vn/api/p/');
    return response.json() as Promise<{ name: string; code: number }[]>;
  }

  async getDistricts(
    provinceCode: string,
  ): Promise<{ name: string; code: number }[]> {
    const response = await fetch(
      `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
    );
    const data = (await response.json()) as {
      districts?: { name: string; code: number }[];
    };
    return data.districts || [];
  }

  async getStates(country: string): Promise<{ name: string; code: string }[]> {
    if (country === 'Vietnam') {
      const provinces = await this.getProvinces();
      return provinces.map((p) => ({
        name: p.name,
        code: String(p.code),
      }));
    }

    try {
      const response = await fetch(
        'https://countriesnow.space/api/v0.1/countries/states',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country }),
        },
      );
      const data = (await response.json()) as {
        data?: { states?: { name: string }[] };
      };
      return (
        data.data?.states?.map((s) => ({ name: s.name, code: s.name })) || []
      );
    } catch {
      return [];
    }
  }

  private assertOwnership(ownerId: string, requesterId: string): void {
    if (ownerId !== requesterId) {
      throw new ForbiddenException('You do not have access to this address');
    }
  }

  private async clearDefaultAddress(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true, deletedAt: null },
      data: { isDefault: false },
    });
  }
}
