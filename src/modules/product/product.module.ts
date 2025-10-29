import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './controllers/product.controller';
import { SizeChartController } from './controllers/size-chart.controller';
import { ProductService } from './services/product.service';
import { SizeChartService } from './services/size-chart.service';
import { ProductRepository } from './repositories/product.repository';
import { Product, ProductSchema } from './schemas/product.schema';
import { SizeChart, SizeChartSchema } from './schemas/size-chart.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Tag, TagSchema } from './schemas/tag.schema';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';
import { ProductImage, ProductImageSchema } from './schemas/product-image.schema';
import { ProductVariation, ProductVariationSchema } from './schemas/product-variation.schema';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: SizeChart.name, schema: SizeChartSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
      { name: Attribute.name, schema: AttributeSchema },
      { name: ProductImage.name, schema: ProductImageSchema },
      { name: ProductVariation.name, schema: ProductVariationSchema },
    ]),
    forwardRef(() => InventoryModule),
  ],
  controllers: [ProductController, SizeChartController],
  providers: [ProductService, SizeChartService, ProductRepository],
  exports: [ProductService, SizeChartService, ProductRepository],
})
export class ProductModule {} 