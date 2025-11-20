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
import { ColorFamilyService } from './services/color-family.service';
import { Schema } from 'mongoose';

// Define schemas for each master data type
const MaterialSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const OccasionSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SeasonSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ColorSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  hexCode: String,
  imageUrl: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PatternSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SleeveLengthSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NecklineSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const LengthSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FitSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AgeGroupSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ColorFamilySchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CareInstructionSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AttributeSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FeatureSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TagSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SizeSchema = new Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  sizeType: String,
  unit: { type: String, enum: ['cm', 'inch', 'US', 'UK', 'EU', 'none'], default: 'none' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Material', schema: MaterialSchema },
      { name: 'Occasion', schema: OccasionSchema },
      { name: 'Season', schema: SeasonSchema },
      { name: 'Color', schema: ColorSchema },
      { name: 'Pattern', schema: PatternSchema },
      { name: 'SleeveLength', schema: SleeveLengthSchema },
      { name: 'Neckline', schema: NecklineSchema },
      { name: 'Length', schema: LengthSchema },
      { name: 'Fit', schema: FitSchema },
      { name: 'AgeGroup', schema: AgeGroupSchema },
      { name: 'ColorFamily', schema: ColorFamilySchema },
      { name: 'CareInstruction', schema: CareInstructionSchema },
      { name: 'Attribute', schema: AttributeSchema },
      { name: 'Feature', schema: FeatureSchema },
      { name: 'Tag', schema: TagSchema },
      { name: 'Size', schema: SizeSchema },
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
    ColorFamilyService,
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
    ColorFamilyService,
    CareInstructionService,
    AttributeService,
    FeatureService,
    TagService,
    SizeService,
  ],
})
export class MasterDataModule {}
