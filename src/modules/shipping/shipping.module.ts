import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingMethod, ShippingMethodSchema } from './schemas/shipping-method.schema';
import { DeliveryCharge, DeliveryChargeSchema } from './schemas/delivery-charge.schema';
import { ShippingController } from './controllers/shipping.controller';
import { ShippingService } from './services/shipping.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingMethod.name, schema: ShippingMethodSchema },
      { name: DeliveryCharge.name, schema: DeliveryChargeSchema },
    ]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {} 