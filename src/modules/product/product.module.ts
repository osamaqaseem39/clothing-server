import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { ProductRepository } from './repositories/product.repository';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Tag, TagSchema } from './schemas/tag.schema';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';
import { ProductImage, ProductImageSchema } from './schemas/product-image.schema';
import { ProductVariation, ProductVariationSchema } from './schemas/product-variation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
      { name: Attribute.name, schema: AttributeSchema },
      { name: ProductImage.name, schema: ProductImageSchema },
      { name: ProductVariation.name, schema: ProductVariationSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {} 