import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
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

@ApiTags('Master Data')
@Controller('master-data')
export class MasterDataController {
  constructor(
    private readonly materialService: MaterialService,
    private readonly occasionService: OccasionService,
    private readonly seasonService: SeasonService,
    private readonly colorService: ColorService,
    private readonly patternService: PatternService,
    private readonly sleeveLengthService: SleeveLengthService,
    private readonly necklineService: NecklineService,
    private readonly lengthService: LengthService,
    private readonly fitService: FitService,
    private readonly ageGroupService: AgeGroupService,
    private readonly careInstructionService: CareInstructionService,
    private readonly attributeService: AttributeService,
    private readonly featureService: FeatureService,
    private readonly tagService: TagService,
    private readonly sizeService: SizeService,
  ) {}

  // Materials (Fabric)
  @Get('materials')
  @ApiOperation({ summary: 'Get all materials' })
  @ApiResponse({ status: 200, description: 'Materials retrieved successfully' })
  async getMaterials() {
    return this.materialService.findAll();
  }

  @Post('materials')
  @ApiOperation({ summary: 'Create a new material' })
  @ApiResponse({ status: 201, description: 'Material created successfully' })
  async createMaterial(@Body() createMaterialDto: any) {
    return this.materialService.create(createMaterialDto);
  }

  // Occasions
  @Get('occasions')
  @ApiOperation({ summary: 'Get all occasions' })
  @ApiResponse({ status: 200, description: 'Occasions retrieved successfully' })
  async getOccasions() {
    return this.occasionService.findAll();
  }

  @Post('occasions')
  @ApiOperation({ summary: 'Create a new occasion' })
  @ApiResponse({ status: 201, description: 'Occasion created successfully' })
  async createOccasion(@Body() createOccasionDto: any) {
    return this.occasionService.create(createOccasionDto);
  }

  // Seasons
  @Get('seasons')
  @ApiOperation({ summary: 'Get all seasons' })
  @ApiResponse({ status: 200, description: 'Seasons retrieved successfully' })
  async getSeasons() {
    return this.seasonService.findAll();
  }

  @Post('seasons')
  @ApiOperation({ summary: 'Create a new season' })
  @ApiResponse({ status: 201, description: 'Season created successfully' })
  async createSeason(@Body() createSeasonDto: any) {
    return this.seasonService.create(createSeasonDto);
  }

  // Colors
  @Get('colors')
  @ApiOperation({ summary: 'Get all colors' })
  @ApiResponse({ status: 200, description: 'Colors retrieved successfully' })
  async getColors() {
    return this.colorService.findAll();
  }

  @Post('colors')
  @ApiOperation({ summary: 'Create a new color' })
  @ApiResponse({ status: 201, description: 'Color created successfully' })
  async createColor(@Body() createColorDto: any) {
    return this.colorService.create(createColorDto);
  }

  // Patterns
  @Get('patterns')
  @ApiOperation({ summary: 'Get all patterns' })
  @ApiResponse({ status: 200, description: 'Patterns retrieved successfully' })
  async getPatterns() {
    return this.patternService.findAll();
  }

  @Post('patterns')
  @ApiOperation({ summary: 'Create a new pattern' })
  @ApiResponse({ status: 201, description: 'Pattern created successfully' })
  async createPattern(@Body() createPatternDto: any) {
    return this.patternService.create(createPatternDto);
  }

  // Sleeve Lengths
  @Get('sleeve-lengths')
  @ApiOperation({ summary: 'Get all sleeve lengths' })
  @ApiResponse({ status: 200, description: 'Sleeve lengths retrieved successfully' })
  async getSleeveLengths() {
    return this.sleeveLengthService.findAll();
  }

  @Post('sleeve-lengths')
  @ApiOperation({ summary: 'Create a new sleeve length' })
  @ApiResponse({ status: 201, description: 'Sleeve length created successfully' })
  async createSleeveLength(@Body() createSleeveLengthDto: any) {
    return this.sleeveLengthService.create(createSleeveLengthDto);
  }

  // Necklines
  @Get('necklines')
  @ApiOperation({ summary: 'Get all necklines' })
  @ApiResponse({ status: 200, description: 'Necklines retrieved successfully' })
  async getNecklines() {
    return this.necklineService.findAll();
  }

  @Post('necklines')
  @ApiOperation({ summary: 'Create a new neckline' })
  @ApiResponse({ status: 201, description: 'Neckline created successfully' })
  async createNeckline(@Body() createNecklineDto: any) {
    return this.necklineService.create(createNecklineDto);
  }

  // Lengths
  @Get('lengths')
  @ApiOperation({ summary: 'Get all lengths' })
  @ApiResponse({ status: 200, description: 'Lengths retrieved successfully' })
  async getLengths() {
    return this.lengthService.findAll();
  }

  @Post('lengths')
  @ApiOperation({ summary: 'Create a new length' })
  @ApiResponse({ status: 201, description: 'Length created successfully' })
  async createLength(@Body() createLengthDto: any) {
    return this.lengthService.create(createLengthDto);
  }

  // Fits
  @Get('fits')
  @ApiOperation({ summary: 'Get all fits' })
  @ApiResponse({ status: 200, description: 'Fits retrieved successfully' })
  async getFits() {
    return this.fitService.findAll();
  }

  @Post('fits')
  @ApiOperation({ summary: 'Create a new fit' })
  @ApiResponse({ status: 201, description: 'Fit created successfully' })
  async createFit(@Body() createFitDto: any) {
    return this.fitService.create(createFitDto);
  }

  // Age Groups
  @Get('age-groups')
  @ApiOperation({ summary: 'Get all age groups' })
  @ApiResponse({ status: 200, description: 'Age groups retrieved successfully' })
  async getAgeGroups() {
    return this.ageGroupService.findAll();
  }

  @Post('age-groups')
  @ApiOperation({ summary: 'Create a new age group' })
  @ApiResponse({ status: 201, description: 'Age group created successfully' })
  async createAgeGroup(@Body() createAgeGroupDto: any) {
    return this.ageGroupService.create(createAgeGroupDto);
  }

  // Care Instructions
  @Get('care-instructions')
  @ApiOperation({ summary: 'Get all care instructions' })
  @ApiResponse({ status: 200, description: 'Care instructions retrieved successfully' })
  async getCareInstructions() {
    return this.careInstructionService.findAll();
  }

  @Post('care-instructions')
  @ApiOperation({ summary: 'Create a new care instruction' })
  @ApiResponse({ status: 201, description: 'Care instruction created successfully' })
  async createCareInstruction(@Body() createCareInstructionDto: any) {
    return this.careInstructionService.create(createCareInstructionDto);
  }

  // Attributes
  @Get('attributes')
  @ApiOperation({ summary: 'Get all attributes' })
  @ApiResponse({ status: 200, description: 'Attributes retrieved successfully' })
  async getAttributes() {
    return this.attributeService.findAll();
  }

  @Post('attributes')
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({ status: 201, description: 'Attribute created successfully' })
  async createAttribute(@Body() createAttributeDto: any) {
    return this.attributeService.create(createAttributeDto);
  }

  // Features
  @Get('features')
  @ApiOperation({ summary: 'Get all features' })
  @ApiResponse({ status: 200, description: 'Features retrieved successfully' })
  async getFeatures() {
    return this.featureService.findAll();
  }

  @Post('features')
  @ApiOperation({ summary: 'Create a new feature' })
  @ApiResponse({ status: 201, description: 'Feature created successfully' })
  async createFeature(@Body() createFeatureDto: any) {
    return this.featureService.create(createFeatureDto);
  }

  // Tags
  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getTags() {
    return this.tagService.findAll();
  }

  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  async createTag(@Body() createTagDto: any) {
    return this.tagService.create(createTagDto);
  }

  // Sizes
  @Get('sizes')
  @ApiOperation({ summary: 'Get all sizes' })
  @ApiResponse({ status: 200, description: 'Sizes retrieved successfully' })
  async getSizes() {
    return this.sizeService.findAll();
  }

  @Post('sizes')
  @ApiOperation({ summary: 'Create a new size' })
  @ApiResponse({ status: 201, description: 'Size created successfully' })
  async createSize(@Body() createSizeDto: any) {
    return this.sizeService.create(createSizeDto);
  }
}
