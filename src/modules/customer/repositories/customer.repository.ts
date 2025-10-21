import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Customer, CustomerDocument } from '../schemas/customer.schema';

@Injectable()
export class CustomerRepository extends BaseRepository<CustomerDocument> {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
  ) {
    super(customerModel);
  }

  async findByEmail(email: string): Promise<CustomerDocument | null> {
    return await this.customerModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailAndPassword(email: string, password: string): Promise<CustomerDocument | null> {
    return await this.customerModel.findOne({
      email: email.toLowerCase(),
      password,
    }).exec();
  }

  async findByName(firstName: string, lastName: string): Promise<CustomerDocument[]> {
    return await this.customerModel
      .find({
        $or: [
          { firstName: { $regex: firstName, $options: 'i' } },
          { lastName: { $regex: lastName, $options: 'i' } },
        ],
      })
      .exec();
  }

  async findByResetToken(token: string): Promise<CustomerDocument | null> {
    return await this.customerModel.findOne({ resetPasswordToken: token }).exec();
  }
} 