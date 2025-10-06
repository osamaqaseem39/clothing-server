import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingMethod, ShippingMethodSchema } from './schemas/shipping-method.schema';
import { ShippingController } from './controllers/shipping.controller';
import { ShippingService } from './services/shipping.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingMethod.name, schema: ShippingMethodSchema },
    ]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {} 