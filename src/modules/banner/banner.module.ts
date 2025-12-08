import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerController } from './controllers/banner.controller';
import { BannerService } from './services/banner.service';
import { BannerRepository } from './repositories/banner.repository';
import { Banner, BannerSchema } from './schemas/banner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
    ]),
  ],
  controllers: [BannerController],
  providers: [BannerService, BannerRepository],
  exports: [BannerService, BannerRepository],
})
export class BannerModule {}

