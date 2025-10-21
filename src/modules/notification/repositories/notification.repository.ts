import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = new this.notificationModel(data);
    return await notification.save();
  }

  async findById(id: string): Promise<Notification | null> {
    return await this.notificationModel.findById(id);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationModel.find();
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification | null> {
    return await this.notificationModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.notificationModel.findByIdAndDelete(id);
    return !!result;
  }
}
