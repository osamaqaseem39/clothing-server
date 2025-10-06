import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @ApiProperty({ description: 'Customer ID' })
  _id: string;

  @ApiProperty({ description: 'First name' })
  @Prop({ required: true, trim: true })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @Prop({ required: true, trim: true })
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @Prop({ trim: true })
  phone?: string;

  @ApiProperty({ description: 'Hashed password' })
  @Prop({ required: true })
  passwordHash: string;

  @ApiProperty({ description: 'Billing address' })
  @Prop({
    type: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      company: { type: String, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
  })
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };

  @ApiProperty({ description: 'Shipping address' })
  @Prop({
    type: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      company: { type: String, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
  })
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Indexes
CustomerSchema.index({ firstName: 1, lastName: 1 });
CustomerSchema.index({ createdAt: -1 }); 