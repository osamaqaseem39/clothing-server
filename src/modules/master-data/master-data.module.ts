import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MasterDataController } from './controllers/master-data.controller';
import { MaterialService } from './services/material.service';
import { OccasionService } from './services/occasion.service';
import { SeasonService } from './services/season.service';
import { ColorService } from './services/color.service';
import { PatternService } from './services/pattern.service';
import { SleeveLengthService } from './services/sleeve-length.service';
import { NecklineService } from './services/neckline.service';
import { LengthService } from './services/length.service';
import { FitService } from './services/fit.service';
import { AgeGroupService } from './services/age-group.service';
import { CareInstructionService } from './services/care-instruction.service';
import { AttributeService } from './services/attribute.service';
import { FeatureService } from './services/feature.service';
import { TagService } from './services/tag.service';
import { SizeService } from './services/size.service';

// Define schemas for each master data type
const MaterialSchema = { name: 'Material', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const OccasionSchema = { name: 'Occasion', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const SeasonSchema = { name: 'Season', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const ColorSchema = { name: 'Color', schema: { name: String, slug: String, hexCode: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const PatternSchema = { name: 'Pattern', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const SleeveLengthSchema = { name: 'SleeveLength', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const NecklineSchema = { name: 'Neckline', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const LengthSchema = { name: 'Length', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const FitSchema = { name: 'Fit', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const AgeGroupSchema = { name: 'AgeGroup', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const CareInstructionSchema = { name: 'CareInstruction', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const AttributeSchema = { name: 'Attribute', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const FeatureSchema = { name: 'Feature', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const TagSchema = { name: 'Tag', schema: { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };
const SizeSchema = { name: 'Size', schema: { name: String, slug: String, description: String, sizeType: String, isActive: { type: Boolean, default: true }, createdAt: Date, updatedAt: Date } };

@Module({
  imports: [
    MongooseModule.forFeature([
      MaterialSchema,
      OccasionSchema,
      SeasonSchema,
      ColorSchema,
      PatternSchema,
      SleeveLengthSchema,
      NecklineSchema,
      LengthSchema,
      FitSchema,
      AgeGroupSchema,
      CareInstructionSchema,
      AttributeSchema,
      FeatureSchema,
      TagSchema,
      SizeSchema,
    ]),
  ],
  controllers: [MasterDataController],
  providers: [
    MaterialService,
    OccasionService,
    SeasonService,
    ColorService,
    PatternService,
    SleeveLengthService,
    NecklineService,
    LengthService,
    FitService,
    AgeGroupService,
    CareInstructionService,
    AttributeService,
    FeatureService,
    TagService,
    SizeService,
  ],
  exports: [
    MaterialService,
    OccasionService,
    SeasonService,
    ColorService,
    PatternService,
    SleeveLengthService,
    NecklineService,
    LengthService,
    FitService,
    AgeGroupService,
    CareInstructionService,
    AttributeService,
    FeatureService,
    TagService,
    SizeService,
  ],
})
export class MasterDataModule {}
