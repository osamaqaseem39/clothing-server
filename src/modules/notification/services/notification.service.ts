import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(notificationData: any): Promise<Notification> {
    const notification = new this.notificationModel(notificationData);
    return await notification.save();
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return await this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string): Promise<Notification> {
    return await this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    ).exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel.countDocuments({ userId, isRead: false });
  }

  async findById(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  async update(id: string, data: any): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndUpdate(id, data, { new: true });
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  async delete(id: string): Promise<void> {
    const result = await this.notificationModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Notification not found');
    }
  }
}
