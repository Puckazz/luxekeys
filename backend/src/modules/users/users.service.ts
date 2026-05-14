import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, UserStatus } from '../../generated/prisma/index.js';
import { PrismaService } from '../database/prisma.service.js';
import { PaginatedResponse } from '../../common/interfaces/index.js';
import {
  ChangePasswordDto,
  CreateAdminUserDto,
  GetAdminUsersQueryDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UpdateUserProfileDto,
} from './dto/index.js';
import {
  AdminUserStatusSummary,
  UserListItem,
  UserProfile,
} from './interfaces/index.js';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    fullName: true,
    phone: true,
    avatarUrl: true,
    role: true,
    status: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  } satisfies Prisma.UserSelect;

  async getAll(
    query: GetUsersQueryDto,
  ): Promise<PaginatedResponse<UserListItem>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: this.userSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: data as UserListItem[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createAdminUser(dto: CreateAdminUserDto): Promise<UserProfile> {
    const email = dto.email.toLowerCase().trim();
    const normalizedPhone = this.normalizeOptionalString(dto.phone);

    await this.ensureEmailAvailable(email);
    if (normalizedPhone) {
      await this.ensurePhoneAvailable(normalizedPhone, '');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName.trim(),
        phone: normalizedPhone,
        passwordHash: await this.hashPassword(dto.password),
        role: dto.role,
        status: dto.status,
      },
      select: this.userSelect,
    });

    return user as UserProfile;
  }

  async findManagementUsers(query: GetAdminUsersQueryDto): Promise<{
    data: {
      items: UserListItem[];
      summary: AdminUserStatusSummary;
    };
    pagination: PaginatedResponse<UserListItem>['pagination'];
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 7;
    const search = query.search?.trim();
    const users = await this.prisma.user.findMany({
      where: {
        ...(query.role ? { role: query.role } : {}),
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: this.userSelect,
    });
    const summary = this.buildAdminUserSummary(users as UserListItem[]);
    const filtered = this.filterManagementUsers(
      users as UserListItem[],
      query.status,
    );
    const sorted = this.sortManagementUsers(filtered, query.sort);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * limit;

    return {
      data: {
        items: sorted.slice(start, start + limit),
        summary,
      },
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getMe(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as UserProfile;
  }

  async updateMe(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const normalizedPhone = this.normalizeOptionalString(dto.phone);

    if (normalizedPhone) {
      await this.ensurePhoneAvailable(normalizedPhone, userId);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
        ...(dto.phone !== undefined && { phone: normalizedPhone }),
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserProfile;
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ passwordChanged: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await this.verifyPassword(
      dto.oldPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      BCRYPT_SALT_ROUNDS,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Revoke all existing refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { passwordChanged: true };
  }

  async getUserById(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as UserProfile;
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<UserProfile> {
    const user = await this.findExistingUser(userId);

    const normalizedEmail =
      dto.email !== undefined ? dto.email.toLowerCase().trim() : undefined;
    const normalizedPhone = this.normalizeOptionalString(dto.phone);

    if (normalizedEmail && normalizedEmail !== user.email) {
      await this.ensureEmailAvailable(normalizedEmail, userId);
    }

    if (normalizedPhone && normalizedPhone !== user.phone) {
      await this.ensurePhoneAvailable(normalizedPhone, userId);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(normalizedEmail !== undefined && { email: normalizedEmail }),
        ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
        ...(dto.phone !== undefined && { phone: normalizedPhone }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      select: this.userSelect,
    });

    return updated as UserProfile;
  }

  async softDelete(userId: string): Promise<UserProfile> {
    const user = await this.findExistingUser(userId);

    if (user.deletedAt) {
      return user as UserProfile;
    }

    const archived = await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
      select: this.userSelect,
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return archived as UserProfile;
  }

  async restore(userId: string): Promise<UserProfile> {
    await this.findExistingUser(userId);

    const restored = await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
        status: UserStatus.INACTIVE,
      },
      select: this.userSelect,
    });

    return restored as UserProfile;
  }

  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private normalizeOptionalString(value?: string): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async ensurePhoneAvailable(
    phone: string,
    userId: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new ConflictException('Phone number is already in use');
    }
  }

  private async findExistingUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async ensureEmailAvailable(
    email: string,
    userId?: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email,
        ...(userId ? { id: { not: userId } } : {}),
      },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  private buildAdminUserSummary(users: UserListItem[]): AdminUserStatusSummary {
    return users.reduce(
      (summary, user) => {
        if (user.deletedAt) {
          summary.ARCHIVED += 1;
          return summary;
        }

        summary.all += 1;
        summary[user.status] += 1;
        return summary;
      },
      {
        all: 0,
        ACTIVE: 0,
        INACTIVE: 0,
        SUSPENDED: 0,
        ARCHIVED: 0,
      },
    );
  }

  private filterManagementUsers(
    users: UserListItem[],
    status?: GetAdminUsersQueryDto['status'],
  ): UserListItem[] {
    return users.filter((user) => {
      if (status === 'ARCHIVED') {
        return Boolean(user.deletedAt);
      }

      if (user.deletedAt) {
        return false;
      }

      if (status) {
        return user.status === status;
      }

      return true;
    });
  }

  private sortManagementUsers(
    users: UserListItem[],
    sort: GetAdminUsersQueryDto['sort'],
  ): UserListItem[] {
    const next = [...users];

    if (sort === 'name-asc') {
      return next.sort((left, right) =>
        left.fullName.localeCompare(right.fullName),
      );
    }

    if (sort === 'name-desc') {
      return next.sort((left, right) =>
        right.fullName.localeCompare(left.fullName),
      );
    }

    if (sort === 'email-asc') {
      return next.sort((left, right) => left.email.localeCompare(right.email));
    }

    return next.sort(
      (left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }
}
