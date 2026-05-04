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
import { AddCartItemDto, UpdateCartItemDto } from './dto/index.js';
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

  @Patch('items/:variantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({
    name: 'variantId',
    type: String,
    format: 'uuid',
    description: 'Product variant ID',
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
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    return this.cartService.updateItem(user.id, variantId, dto);
  }

  @Delete('items/:variantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({
    name: 'variantId',
    type: String,
    format: 'uuid',
    description: 'Product variant ID',
  })
  @ApiOkResponse({
    description: 'Updated cart',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'Cart or item not found' })
  removeItem(
    @CurrentUser() user: AuthUser,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<CartResponse> {
    return this.cartService.removeItem(user.id, variantId);
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
