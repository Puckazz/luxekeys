import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/index.js';
import { JwtAuthGuard } from '../../common/guards/index.js';
import type { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto.js';
import { WishlistService } from './wishlist.service.js';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'List current user wishlist items' })
  @ApiOkResponse({ description: 'List of wishlist items' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.wishlistService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a product to wishlist' })
  @ApiOkResponse({ description: 'Wishlist item' })
  add(@CurrentUser() user: AuthUser, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.add(user.id, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from wishlist' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Product removed from wishlist' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.remove(user.id, productId);
  }
}
