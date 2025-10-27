import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { Cart } from '../schemas/cart.schema';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new cart' })
  @ApiResponse({
    status: 201,
    description: 'Cart created successfully',
    type: Cart,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'Customer ID (optional)',
        },
      },
    },
  })
  async createCart(@Body('customerId') customerId?: string): Promise<Cart> {
    return await this.cartService.createCart(customerId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get cart by session ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async getCartBySessionId(@Param('sessionId') sessionId: string): Promise<Cart> {
    return await this.cartService.getCartBySessionId(sessionId);
  }

  @Get('customer/current-user-id')
  @ApiOperation({ summary: 'Get cart for current user (placeholder endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Empty cart returned for guest user',
  })
  async getCurrentUserCart(): Promise<{ items: any[]; total: number; isEmpty: boolean }> {
    // Return empty cart for guest users
    return {
      items: [],
      total: 0,
      isEmpty: true,
    };
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get cart by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  async getCartByCustomerId(@Param('customerId') customerId: string): Promise<Cart> {
    return await this.cartService.getCartByCustomerId(customerId);
  }

  @Post(':cartId/items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 200,
    description: 'Item added to cart successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiBody({ type: AddToCartDto })
  @ApiQuery({ name: 'variationId', description: 'Product variation ID (optional)', required: false })
  async addToCart(
    @Param('cartId') cartId: string,
    @Body() addToCartDto: AddToCartDto,
    @Query('variationId') variationId?: string,
  ): Promise<Cart> {
    if (variationId) {
      addToCartDto.variationId = variationId;
    }
    return await this.cartService.addItemToCart(cartId, addToCartDto);
  }

  @Patch(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart or item not found',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiQuery({ name: 'variationId', description: 'Product variation ID (optional)', required: false })
  async updateCartItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Query('variationId') variationId?: string,
  ): Promise<Cart> {
    return await this.cartService.updateCartItemQuantity(
      cartId, 
      itemId, 
      variationId || null, 
      updateCartItemDto.quantity
    );
  }

  @Delete(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart or item not found',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  async removeFromCart(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ): Promise<Cart> {
    return await this.cartService.removeItemFromCart(cartId, itemId);
  }

  @Delete(':cartId/clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  async clearCart(@Param('cartId') cartId: string): Promise<Cart> {
    return await this.cartService.clearCart(cartId);
  }

  @Patch(':cartId/assign-customer')
  @ApiOperation({ summary: 'Assign cart to customer' })
  @ApiResponse({
    status: 200,
    description: 'Cart assigned to customer successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cart already assigned to customer',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'Customer ID',
        },
      },
      required: ['customerId'],
    },
  })
  async assignCartToCustomer(
    @Param('cartId') cartId: string,
    @Body('customerId') customerId: string,
  ): Promise<Cart> {
    return await this.cartService.assignCartToCustomer(cartId, customerId);
  }

  @Post(':cartId/merge')
  @ApiOperation({ summary: 'Merge guest cart with customer cart' })
  @ApiResponse({
    status: 200,
    description: 'Carts merged successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cannot merge carts',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiParam({ name: 'cartId', description: 'Guest cart ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerCartId: {
          type: 'string',
          description: 'Customer cart ID',
        },
      },
      required: ['customerCartId'],
    },
  })
  async mergeCarts(
    @Param('cartId') cartId: string,
    @Body('customerId') customerId: string,
  ): Promise<Cart> {
    return await this.cartService.mergeGuestCartWithCustomerCart(cartId, customerId);
  }

  @Get(':cartId/total')
  @ApiOperation({ summary: 'Calculate cart total' })
  @ApiResponse({
    status: 200,
    description: 'Cart total calculated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  async getCartTotal(@Param('cartId') cartId: string) {
    return await this.cartService.calculateCartTotal(cartId);
  }
} 