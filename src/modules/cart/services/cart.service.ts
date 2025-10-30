import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../../common/services/base.service';
import { CartRepository } from '../repositories/cart.repository';
import { CartDocument } from '../schemas/cart.schema';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService extends BaseService<CartDocument> {
  constructor(private readonly cartRepository: CartRepository) {
    super(cartRepository);
  }

  async createCart(customerId?: string): Promise<CartDocument> {
    const sessionId = uuidv4();
    const cartData = {
      sessionId,
      customerId,
      items: [],
      total: 0,
      currency: 'PKR',
    };

    return await this.cartRepository.create(cartData);
  }

  async getCartBySessionId(sessionId: string): Promise<CartDocument> {
    const cart = await this.cartRepository.findBySessionId(sessionId);
    if (!cart) {
      throw new NotFoundException(`Cart with session ID '${sessionId}' not found`);
    }
    return cart;
  }

  async getCartByCustomerId(customerId: string): Promise<CartDocument> {
    const cart = await this.cartRepository.findByCustomerId(customerId);
    if (!cart) {
      throw new NotFoundException(`Cart for customer '${customerId}' not found`);
    }
    return cart;
  }

  async addItemToCart(cartId: string, addToCartDto: AddToCartDto): Promise<CartDocument> {
    // Check if cart exists
    await this.findById(cartId);

    // Check if item already exists in cart
    const cart = await this.findById(cartId);
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === addToCartDto.productId &&
              (addToCartDto.variationId ? item.variationId?.toString() === addToCartDto.variationId : !item.variationId)
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      return await this.updateCartItemQuantity(cartId, addToCartDto.productId, addToCartDto.variationId || null, newQuantity);
    }

    // Add new item
    const newItem = {
      productId: addToCartDto.productId,
      variationId: addToCartDto.variationId,
      quantity: addToCartDto.quantity,
      price: 0, // This should be fetched from product service in a real implementation
    };

    return await this.cartRepository.addItemToCart(cartId, newItem);
  }

  async updateCartItemQuantity(cartId: string, productId: string, variationId: string | null, quantity: number): Promise<CartDocument> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const updatedCart = await this.cartRepository.updateCartItemQuantity(cartId, productId, variationId, quantity);
    if (!updatedCart) {
      throw new NotFoundException('Cart item not found or cart not found');
    }

    return updatedCart;
  }

  async removeItemFromCart(cartId: string, productId: string, variationId?: string): Promise<CartDocument> {
    const updatedCart = await this.cartRepository.removeItemFromCart(cartId, productId, variationId || null);
    if (!updatedCart) {
      throw new NotFoundException('Cart item not found or cart not found');
    }

    return updatedCart;
  }

  async clearCart(cartId: string): Promise<CartDocument> {
    const updatedCart = await this.cartRepository.clearCart(cartId);
    if (!updatedCart) {
      throw new NotFoundException(`Cart with ID '${cartId}' not found`);
    }

    return updatedCart;
  }

  async assignCartToCustomer(sessionId: string, customerId: string): Promise<CartDocument> {
    const updatedCart = await this.cartRepository.assignCartToCustomer(sessionId, customerId);
    if (!updatedCart) {
      throw new NotFoundException(`Cart with session ID '${sessionId}' not found`);
    }

    return updatedCart;
  }

  async mergeGuestCartWithCustomerCart(sessionId: string, customerId: string): Promise<CartDocument> {
    // Get guest cart
    const guestCart = await this.getCartBySessionId(sessionId);
    
    // Check if customer already has a cart
    let customerCart = await this.cartRepository.findByCustomerId(customerId);
    
    if (!customerCart) {
      // Create new customer cart
      customerCart = await this.createCart(customerId);
    }

    // Merge items from guest cart to customer cart
    for (const item of guestCart.items) {
      await this.addItemToCart(customerCart._id, {
        productId: item.productId.toString(),
        variationId: item.variationId?.toString(),
        quantity: item.quantity,
      });
    }

    // Delete guest cart
    await this.delete(guestCart._id);

    return await this.findById(customerCart._id);
  }

  async calculateCartTotal(cartId: string): Promise<number> {
    const cart = await this.findById(cartId);
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart total
    await this.cartRepository.update(cartId, { total });
    
    return total;
  }
} 