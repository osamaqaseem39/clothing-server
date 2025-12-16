import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @ApiProperty({ description: 'Category ID' })
  _id: string;

  @ApiProperty({ description: 'Category name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @ApiProperty({ description: 'Category description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Parent category ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  parentId?: string;

  @ApiProperty({ description: 'Category image URL' })
  @Prop()
  image?: string;

  @ApiProperty({ description: 'Category icon' })
  @Prop()
  icon?: string;

  @ApiProperty({ description: 'Category color for UI' })
  @Prop()
  color?: string;

  @ApiProperty({ description: 'Whether category is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order for display' })
  @Prop({ default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'SEO meta title' })
  @Prop()
  metaTitle?: string;

  @ApiProperty({ description: 'SEO meta description' })
  @Prop()
  metaDescription?: string;

  @ApiProperty({ description: 'SEO meta keywords' })
  @Prop()
  metaKeywords?: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Pre-save hook to ensure default values for existing documents
CategorySchema.pre('save', function(next) {
  // Set default values if they don't exist
  if (this.isNew || this.isModified('isActive') === false) {
    if (this.isActive === undefined || this.isActive === null) {
      this.isActive = true;
    }
  }
  if (this.isNew || this.isModified('sortOrder') === false) {
    if (this.sortOrder === undefined || this.sortOrder === null) {
      this.sortOrder = 0;
    }
  }
  next();
});

// Post-find hook to ensure defaults are set on retrieved documents
CategorySchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
  if (!docs) return;
  
  const documents = Array.isArray(docs) ? docs : [docs];
  documents.forEach((doc: any) => {
    if (doc && typeof doc === 'object') {
      if (doc.isActive === undefined || doc.isActive === null) {
        doc.isActive = true;
      }
      if (doc.sortOrder === undefined || doc.sortOrder === null) {
        doc.sortOrder = 0;
      }
    }
  });
});

// Transform to ensure defaults are included in JSON serialization
CategorySchema.set('toJSON', {
  transform: function(doc, ret) {
    // Ensure isActive defaults to true if not set
    if (ret.isActive === undefined || ret.isActive === null) {
      ret.isActive = true;
    }
    // Ensure sortOrder defaults to 0 if not set
    if (ret.sortOrder === undefined || ret.sortOrder === null) {
      ret.sortOrder = 0;
    }
    return ret;
  }
});

// Also set toObject transform for consistency
CategorySchema.set('toObject', {
  transform: function(doc, ret) {
    // Ensure isActive defaults to true if not set
    if (ret.isActive === undefined || ret.isActive === null) {
      ret.isActive = true;
    }
    // Ensure sortOrder defaults to 0 if not set
    if (ret.sortOrder === undefined || ret.sortOrder === null) {
      ret.sortOrder = 0;
    }
    return ret;
  }
});

// Indexes
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ name: 'text', description: 'text' });
