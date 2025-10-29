import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MaterialService } from '../services/material.service';
import { OccasionService } from '../services/occasion.service';
import { SeasonService } from '../services/season.service';
import { ColorService } from '../services/color.service';
import { PatternService } from '../services/pattern.service';
import { SleeveLengthService } from '../services/sleeve-length.service';
import { NecklineService } from '../services/neckline.service';
import { LengthService } from '../services/length.service';
import { FitService } from '../services/fit.service';
import { AgeGroupService } from '../services/age-group.service';
import { ColorFamilyService } from '../services/color-family.service';
import { CareInstructionService } from '../services/care-instruction.service';
import { AttributeService } from '../services/attribute.service';
import { FeatureService } from '../services/feature.service';
import { TagService } from '../services/tag.service';
import { SizeService } from '../services/size.service';

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
    private readonly colorFamilyService: ColorFamilyService,
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

  @Get('materials/:id')
  @ApiOperation({ summary: 'Get a material by ID' })
  @ApiResponse({ status: 200, description: 'Material retrieved successfully' })
  async getMaterialById(@Param('id') id: string) {
    return this.materialService.findById(id);
  }

  @Put('materials/:id')
  @ApiOperation({ summary: 'Update a material' })
  @ApiResponse({ status: 200, description: 'Material updated successfully' })
  async updateMaterial(@Param('id') id: string, @Body() updateMaterialDto: any) {
    return this.materialService.update(id, updateMaterialDto);
  }

  @Delete('materials/:id')
  @ApiOperation({ summary: 'Delete a material' })
  @ApiResponse({ status: 200, description: 'Material deleted successfully' })
  async deleteMaterial(@Param('id') id: string) {
    return this.materialService.delete(id);
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

  @Get('occasions/:id')
  @ApiOperation({ summary: 'Get an occasion by ID' })
  @ApiResponse({ status: 200, description: 'Occasion retrieved successfully' })
  async getOccasionById(@Param('id') id: string) {
    return this.occasionService.findById(id);
  }

  @Put('occasions/:id')
  @ApiOperation({ summary: 'Update an occasion' })
  @ApiResponse({ status: 200, description: 'Occasion updated successfully' })
  async updateOccasion(@Param('id') id: string, @Body() updateOccasionDto: any) {
    return this.occasionService.update(id, updateOccasionDto);
  }

  @Delete('occasions/:id')
  @ApiOperation({ summary: 'Delete an occasion' })
  @ApiResponse({ status: 200, description: 'Occasion deleted successfully' })
  async deleteOccasion(@Param('id') id: string) {
    return this.occasionService.delete(id);
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

  @Get('seasons/:id')
  @ApiOperation({ summary: 'Get a season by ID' })
  @ApiResponse({ status: 200, description: 'Season retrieved successfully' })
  async getSeasonById(@Param('id') id: string) {
    return this.seasonService.findById(id);
  }

  @Put('seasons/:id')
  @ApiOperation({ summary: 'Update a season' })
  @ApiResponse({ status: 200, description: 'Season updated successfully' })
  async updateSeason(@Param('id') id: string, @Body() updateSeasonDto: any) {
    return this.seasonService.update(id, updateSeasonDto);
  }

  @Delete('seasons/:id')
  @ApiOperation({ summary: 'Delete a season' })
  @ApiResponse({ status: 200, description: 'Season deleted successfully' })
  async deleteSeason(@Param('id') id: string) {
    return this.seasonService.delete(id);
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

  @Get('colors/:id')
  @ApiOperation({ summary: 'Get a color by ID' })
  @ApiResponse({ status: 200, description: 'Color retrieved successfully' })
  async getColorById(@Param('id') id: string) {
    return this.colorService.findById(id);
  }

  @Put('colors/:id')
  @ApiOperation({ summary: 'Update a color' })
  @ApiResponse({ status: 200, description: 'Color updated successfully' })
  async updateColor(@Param('id') id: string, @Body() updateColorDto: any) {
    return this.colorService.update(id, updateColorDto);
  }

  @Delete('colors/:id')
  @ApiOperation({ summary: 'Delete a color' })
  @ApiResponse({ status: 200, description: 'Color deleted successfully' })
  async deleteColor(@Param('id') id: string) {
    return this.colorService.delete(id);
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

  @Get('patterns/:id')
  @ApiOperation({ summary: 'Get a pattern by ID' })
  @ApiResponse({ status: 200, description: 'Pattern retrieved successfully' })
  async getPatternById(@Param('id') id: string) {
    return this.patternService.findById(id);
  }

  @Put('patterns/:id')
  @ApiOperation({ summary: 'Update a pattern' })
  @ApiResponse({ status: 200, description: 'Pattern updated successfully' })
  async updatePattern(@Param('id') id: string, @Body() updatePatternDto: any) {
    return this.patternService.update(id, updatePatternDto);
  }

  @Delete('patterns/:id')
  @ApiOperation({ summary: 'Delete a pattern' })
  @ApiResponse({ status: 200, description: 'Pattern deleted successfully' })
  async deletePattern(@Param('id') id: string) {
    return this.patternService.delete(id);
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

  @Get('sleeve-lengths/:id')
  @ApiOperation({ summary: 'Get a sleeve length by ID' })
  @ApiResponse({ status: 200, description: 'Sleeve length retrieved successfully' })
  async getSleeveLengthById(@Param('id') id: string) {
    return this.sleeveLengthService.findById(id);
  }

  @Put('sleeve-lengths/:id')
  @ApiOperation({ summary: 'Update a sleeve length' })
  @ApiResponse({ status: 200, description: 'Sleeve length updated successfully' })
  async updateSleeveLength(@Param('id') id: string, @Body() updateSleeveLengthDto: any) {
    return this.sleeveLengthService.update(id, updateSleeveLengthDto);
  }

  @Delete('sleeve-lengths/:id')
  @ApiOperation({ summary: 'Delete a sleeve length' })
  @ApiResponse({ status: 200, description: 'Sleeve length deleted successfully' })
  async deleteSleeveLength(@Param('id') id: string) {
    return this.sleeveLengthService.delete(id);
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

  @Get('necklines/:id')
  @ApiOperation({ summary: 'Get a neckline by ID' })
  @ApiResponse({ status: 200, description: 'Neckline retrieved successfully' })
  async getNecklineById(@Param('id') id: string) {
    return this.necklineService.findById(id);
  }

  @Put('necklines/:id')
  @ApiOperation({ summary: 'Update a neckline' })
  @ApiResponse({ status: 200, description: 'Neckline updated successfully' })
  async updateNeckline(@Param('id') id: string, @Body() updateNecklineDto: any) {
    return this.necklineService.update(id, updateNecklineDto);
  }

  @Delete('necklines/:id')
  @ApiOperation({ summary: 'Delete a neckline' })
  @ApiResponse({ status: 200, description: 'Neckline deleted successfully' })
  async deleteNeckline(@Param('id') id: string) {
    return this.necklineService.delete(id);
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

  @Get('lengths/:id')
  @ApiOperation({ summary: 'Get a length by ID' })
  @ApiResponse({ status: 200, description: 'Length retrieved successfully' })
  async getLengthById(@Param('id') id: string) {
    return this.lengthService.findById(id);
  }

  @Put('lengths/:id')
  @ApiOperation({ summary: 'Update a length' })
  @ApiResponse({ status: 200, description: 'Length updated successfully' })
  async updateLength(@Param('id') id: string, @Body() updateLengthDto: any) {
    return this.lengthService.update(id, updateLengthDto);
  }

  @Delete('lengths/:id')
  @ApiOperation({ summary: 'Delete a length' })
  @ApiResponse({ status: 200, description: 'Length deleted successfully' })
  async deleteLength(@Param('id') id: string) {
    return this.lengthService.delete(id);
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

  @Get('fits/:id')
  @ApiOperation({ summary: 'Get a fit by ID' })
  @ApiResponse({ status: 200, description: 'Fit retrieved successfully' })
  async getFitById(@Param('id') id: string) {
    return this.fitService.findById(id);
  }

  @Put('fits/:id')
  @ApiOperation({ summary: 'Update a fit' })
  @ApiResponse({ status: 200, description: 'Fit updated successfully' })
  async updateFit(@Param('id') id: string, @Body() updateFitDto: any) {
    return this.fitService.update(id, updateFitDto);
  }

  @Delete('fits/:id')
  @ApiOperation({ summary: 'Delete a fit' })
  @ApiResponse({ status: 200, description: 'Fit deleted successfully' })
  async deleteFit(@Param('id') id: string) {
    return this.fitService.delete(id);
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

  @Get('age-groups/:id')
  @ApiOperation({ summary: 'Get an age group by ID' })
  @ApiResponse({ status: 200, description: 'Age group retrieved successfully' })
  async getAgeGroupById(@Param('id') id: string) {
    return this.ageGroupService.findById(id);
  }

  @Put('age-groups/:id')
  @ApiOperation({ summary: 'Update an age group' })
  @ApiResponse({ status: 200, description: 'Age group updated successfully' })
  async updateAgeGroup(@Param('id') id: string, @Body() updateAgeGroupDto: any) {
    return this.ageGroupService.update(id, updateAgeGroupDto);
  }

  @Delete('age-groups/:id')
  @ApiOperation({ summary: 'Delete an age group' })
  @ApiResponse({ status: 200, description: 'Age group deleted successfully' })
  async deleteAgeGroup(@Param('id') id: string) {
    return this.ageGroupService.delete(id);
  }

  // Color Families
  @Get('color-families')
  @ApiOperation({ summary: 'Get all color families' })
  @ApiResponse({ status: 200, description: 'Color families retrieved successfully' })
  async getColorFamilies() {
    return this.colorFamilyService.findAll();
  }

  @Post('color-families')
  @ApiOperation({ summary: 'Create a new color family' })
  @ApiResponse({ status: 201, description: 'Color family created successfully' })
  async createColorFamily(@Body() createColorFamilyDto: any) {
    return this.colorFamilyService.create(createColorFamilyDto);
  }

  @Put('color-families/:id')
  @ApiOperation({ summary: 'Update a color family' })
  @ApiResponse({ status: 200, description: 'Color family updated successfully' })
  async updateColorFamily(@Param('id') id: string, @Body() updateColorFamilyDto: any) {
    return this.colorFamilyService.update(id, updateColorFamilyDto);
  }

  @Delete('color-families/:id')
  @ApiOperation({ summary: 'Delete a color family' })
  @ApiResponse({ status: 200, description: 'Color family deleted successfully' })
  async deleteColorFamily(@Param('id') id: string) {
    return this.colorFamilyService.delete(id);
  }

  @Get('color-families/:id')
  @ApiOperation({ summary: 'Get a color family by ID' })
  @ApiResponse({ status: 200, description: 'Color family retrieved successfully' })
  async getColorFamilyById(@Param('id') id: string) {
    return this.colorFamilyService.findById(id);
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

  @Get('care-instructions/:id')
  @ApiOperation({ summary: 'Get a care instruction by ID' })
  @ApiResponse({ status: 200, description: 'Care instruction retrieved successfully' })
  async getCareInstructionById(@Param('id') id: string) {
    return this.careInstructionService.findById(id);
  }

  @Put('care-instructions/:id')
  @ApiOperation({ summary: 'Update a care instruction' })
  @ApiResponse({ status: 200, description: 'Care instruction updated successfully' })
  async updateCareInstruction(@Param('id') id: string, @Body() updateCareInstructionDto: any) {
    return this.careInstructionService.update(id, updateCareInstructionDto);
  }

  @Delete('care-instructions/:id')
  @ApiOperation({ summary: 'Delete a care instruction' })
  @ApiResponse({ status: 200, description: 'Care instruction deleted successfully' })
  async deleteCareInstruction(@Param('id') id: string) {
    return this.careInstructionService.delete(id);
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

  @Get('attributes/:id')
  @ApiOperation({ summary: 'Get an attribute by ID' })
  @ApiResponse({ status: 200, description: 'Attribute retrieved successfully' })
  async getAttributeById(@Param('id') id: string) {
    return this.attributeService.findById(id);
  }

  @Put('attributes/:id')
  @ApiOperation({ summary: 'Update an attribute' })
  @ApiResponse({ status: 200, description: 'Attribute updated successfully' })
  async updateAttribute(@Param('id') id: string, @Body() updateAttributeDto: any) {
    return this.attributeService.update(id, updateAttributeDto);
  }

  @Delete('attributes/:id')
  @ApiOperation({ summary: 'Delete an attribute' })
  @ApiResponse({ status: 200, description: 'Attribute deleted successfully' })
  async deleteAttribute(@Param('id') id: string) {
    return this.attributeService.delete(id);
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

  @Get('features/:id')
  @ApiOperation({ summary: 'Get a feature by ID' })
  @ApiResponse({ status: 200, description: 'Feature retrieved successfully' })
  async getFeatureById(@Param('id') id: string) {
    return this.featureService.findById(id);
  }

  @Put('features/:id')
  @ApiOperation({ summary: 'Update a feature' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully' })
  async updateFeature(@Param('id') id: string, @Body() updateFeatureDto: any) {
    return this.featureService.update(id, updateFeatureDto);
  }

  @Delete('features/:id')
  @ApiOperation({ summary: 'Delete a feature' })
  @ApiResponse({ status: 200, description: 'Feature deleted successfully' })
  async deleteFeature(@Param('id') id: string) {
    return this.featureService.delete(id);
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

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  async getTagById(@Param('id') id: string) {
    return this.tagService.findById(id);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  async updateTag(@Param('id') id: string, @Body() updateTagDto: any) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  async deleteTag(@Param('id') id: string) {
    return this.tagService.delete(id);
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

  @Get('sizes/:id')
  @ApiOperation({ summary: 'Get a size by ID' })
  @ApiResponse({ status: 200, description: 'Size retrieved successfully' })
  async getSizeById(@Param('id') id: string) {
    return this.sizeService.findById(id);
  }

  @Put('sizes/:id')
  @ApiOperation({ summary: 'Update a size' })
  @ApiResponse({ status: 200, description: 'Size updated successfully' })
  async updateSize(@Param('id') id: string, @Body() updateSizeDto: any) {
    return this.sizeService.update(id, updateSizeDto);
  }

  @Delete('sizes/:id')
  @ApiOperation({ summary: 'Delete a size' })
  @ApiResponse({ status: 200, description: 'Size deleted successfully' })
  async deleteSize(@Param('id') id: string) {
    return this.sizeService.delete(id);
  }
}
