import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Cart, CartDocument } from '../schemas/cart.schema';

@Injectable()
export class CartRepository extends BaseRepository<CartDocument> {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
  ) {
    super(cartModel);
  }

  async findBySessionId(sessionId: string): Promise<CartDocument | null> {
    return await this.cartModel.findOne({ sessionId }).exec();
  }

  async findByCustomerId(customerId: string): Promise<CartDocument | null> {
    return await this.cartModel.findOne({ customerId }).exec();
  }

  async addItemToCart(cartId: string, item: any): Promise<CartDocument | null> {
    return await this.cartModel.findByIdAndUpdate(
      cartId,
      {
        $push: { items: item },
        $inc: { total: item.price * item.quantity },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec();
  }

  async updateCartItemQuantity(cartId: string, productId: string, variationId: string | null, quantity: number): Promise<CartDocument | null> {
    const cart = await this.findById(cartId);
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && 
              (variationId ? item.variationId?.toString() === variationId : !item.variationId)
    );

    if (itemIndex === -1) return null;

    const oldItem = cart.items[itemIndex];
    const quantityDiff = quantity - oldItem.quantity;
    const totalDiff = oldItem.price * quantityDiff;

    return await this.cartModel.findByIdAndUpdate(
      cartId,
      {
        $set: { [`items.${itemIndex}.quantity`]: quantity },
        $inc: { total: totalDiff },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec();
  }

  async removeItemFromCart(cartId: string, productId: string, variationId: string | null): Promise<CartDocument | null> {
    const cart = await this.findById(cartId);
    if (!cart) return null;

    const item = cart.items.find(
      item => item.productId.toString() === productId && 
              (variationId ? item.variationId?.toString() === variationId : !item.variationId)
    );

    if (!item) return null;

    const totalDiff = -(item.price * item.quantity);

    return await this.cartModel.findByIdAndUpdate(
      cartId,
      {
        $pull: {
          items: {
            productId: productId,
            variationId: variationId || { $exists: false }
          }
        },
        $inc: { total: totalDiff },
        updatedAt: new Date(),
      },
      { new: true }
    ).exec();
  }

  async clearCart(cartId: string): Promise<CartDocument | null> {
    return await this.cartModel.findByIdAndUpdate(
      cartId,
      {
        $set: { items: [], total: 0, updatedAt: new Date() }
      },
      { new: true }
    ).exec();
  }

  async assignCartToCustomer(sessionId: string, customerId: string): Promise<CartDocument | null> {
    return await this.cartModel.findOneAndUpdate(
      { sessionId },
      { customerId, updatedAt: new Date() },
      { new: true }
    ).exec();
  }
} 