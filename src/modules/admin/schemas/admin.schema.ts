import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: 'admin' })
  role: 'admin' | 'super_admin';

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  passwordChangedAt?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Index for email lookups
AdminSchema.index({ email: 1 });

// Index for password reset tokens
AdminSchema.index({ passwordResetToken: 1 });

// Index for email verification tokens
AdminSchema.index({ emailVerificationToken: 1 }); 