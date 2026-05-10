import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/index.js';
import { JwtAuthGuard } from '../../common/guards/index.js';
import type { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import { AddCartItemDto, SyncCartDto, UpdateCartItemDto } from './dto/index.js';
import { CartResponse } from './interfaces/index.js';
import { CartService } from './cart.service.js';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiOkResponse({
    description: 'User cart with items',
    type: Object,
  })
  getCart(@CurrentUser() user: AuthUser): Promise<CartResponse> {
    return this.cartService.getCart(user.id);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync guest cart with user cart' })
  @ApiOkResponse({
    description: 'Merged cart',
    type: Object,
  })
  syncCart(
    @CurrentUser() user: AuthUser,
    @Body() dto: SyncCartDto,
  ): Promise<CartResponse> {
    return this.cartService.syncCart(user.id, dto);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiOkResponse({
    description: 'Updated cart',
    type: Object,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or insufficient stock',
  })
  addItem(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponse> {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:cartItemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({
    name: 'cartItemId',
    type: String,
    format: 'uuid',
    description: 'Cart item ID',
  })
  @ApiOkResponse({
    description: 'Updated cart',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'Cart or item not found' })
  @ApiBadRequestResponse({
    description: 'Invalid request or insufficient stock',
  })
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    return this.cartService.updateItem(user.id, cartItemId, dto);
  }

  @Delete('items/:cartItemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({
    name: 'cartItemId',
    type: String,
    format: 'uuid',
    description: 'Cart item ID',
  })
  @ApiOkResponse({
    description: 'Updated cart',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'Cart or item not found' })
  removeItem(
    @CurrentUser() user: AuthUser,
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
  ): Promise<CartResponse> {
    return this.cartService.removeItem(user.id, cartItemId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiOkResponse({
    description: 'Cart cleared successfully',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  clearCart(@CurrentUser() user: AuthUser): Promise<{ cleared: boolean }> {
    return this.cartService.clearCart(user.id);
  }
}
