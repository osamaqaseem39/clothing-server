import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingMethod, ShippingMethodDocument } from '../schemas/shipping-method.schema';
import { CreateShippingMethodDto } from '../dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from '../dto/update-shipping-method.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(ShippingMethod.name) private readonly shippingMethodModel: Model<ShippingMethodDocument>,
  ) {}

  async createShippingMethod(createShippingMethodDto: CreateShippingMethodDto): Promise<ShippingMethodDocument> {
    // Check if shipping method with same name already exists
    const existingMethod = await this.shippingMethodModel.findOne({ 
      name: createShippingMethodDto.name 
    });
    
    if (existingMethod) {
      throw new ConflictException(`Shipping method with name '${createShippingMethodDto.name}' already exists`);
    }

    const shippingMethod = new this.shippingMethodModel(createShippingMethodDto);
    return await shippingMethod.save();
  }

  async findAll(): Promise<ShippingMethodDocument[]> {
    return await this.shippingMethodModel.find().sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findActive(): Promise<ShippingMethodDocument[]> {
    return await this.shippingMethodModel.find({ enabled: true }).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findById(id: string): Promise<ShippingMethodDocument> {
    const shippingMethod = await this.shippingMethodModel.findById(id).exec();
    if (!shippingMethod) {
      throw new NotFoundException(`Shipping method with ID ${id} not found`);
    }
    return shippingMethod;
  }

  async updateShippingMethod(id: string, updateShippingMethodDto: UpdateShippingMethodDto): Promise<ShippingMethodDocument> {
    // Check if shipping method exists
    await this.findById(id);

    // If updating name, check for conflicts
    if (updateShippingMethodDto.name) {
      const existingMethod = await this.shippingMethodModel.findOne({ 
        name: updateShippingMethodDto.name,
        _id: { $ne: id }
      });
      
      if (existingMethod) {
        throw new ConflictException(`Shipping method with name '${updateShippingMethodDto.name}' already exists`);
      }
    }

    const updatedMethod = await this.shippingMethodModel.findByIdAndUpdate(
      id,
      updateShippingMethodDto,
      { new: true }
    ).exec();

    if (!updatedMethod) {
      throw new NotFoundException(`Shipping method with ID ${id} not found`);
    }

    return updatedMethod;
  }

  async toggleStatus(id: string, enabled: boolean): Promise<ShippingMethodDocument> {
    const shippingMethod = await this.findById(id);
    shippingMethod.enabled = enabled;
    return await shippingMethod.save();
  }

  async delete(id: string): Promise<void> {
    const shippingMethod = await this.findById(id);
    
    // Check if shipping method is in use (you might want to add this logic)
    // For now, we'll allow deletion
    
    await this.shippingMethodModel.findByIdAndDelete(id).exec();
  }

  async calculateShipping(calculateShippingDto: any): Promise<any> {
    const { shippingAddress, packageDetails, orderId } = calculateShippingDto;
    
    // Get available shipping methods for the destination
    const availableMethods = await this.getAvailableMethodsForDestination(shippingAddress);
    
    if (availableMethods.length === 0) {
      throw new BadRequestException('No shipping methods available for this destination');
    }

    // Calculate costs for each method
    const methodsWithCosts = availableMethods.map(method => {
      const cost = this.calculateMethodCost(method, packageDetails);
      return {
        methodId: method._id,
        name: method.name,
        cost,
        estimatedDays: method.estimatedDeliveryDays || 3,
        description: method.description || '',
      };
    });

    // Sort by cost
    methodsWithCosts.sort((a, b) => a.cost - b.cost);

    return {
      availableMethods: methodsWithCosts,
      totalCost: methodsWithCosts.length > 0 ? methodsWithCosts[0].cost : 0,
      currency: 'USD', // You might want to make this configurable
    };
  }

  async getShippingZones(): Promise<any[]> {
    // This is a simplified implementation
    // In a real application, you might have a separate zones collection
    return [
      {
        id: 'domestic',
        name: 'Domestic',
        countries: ['US'],
        regions: ['North America'],
        baseCost: 5.99,
        additionalCost: 0.50,
      },
      {
        id: 'international',
        name: 'International',
        countries: ['CA', 'MX', 'UK', 'DE', 'FR'],
        regions: ['Europe', 'North America'],
        baseCost: 19.99,
        additionalCost: 2.00,
      },
    ];
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    // This is a mock implementation
    // In a real application, you would integrate with shipping carriers
    if (!trackingNumber || trackingNumber.length < 8) {
      throw new BadRequestException('Invalid tracking number');
    }

    // Mock tracking data
    return {
      trackingNumber,
      status: 'In Transit',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      currentLocation: 'Distribution Center',
      history: [
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Origin Facility',
          status: 'Picked Up',
          description: 'Package picked up from seller',
        },
        {
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Distribution Center',
          status: 'In Transit',
          description: 'Package in transit to destination',
        },
      ],
    };
  }

  private async getAvailableMethodsForDestination(shippingAddress: any): Promise<ShippingMethodDocument[]> {
    const { country, state, city } = shippingAddress;
    
    // Get all enabled shipping methods
    const methods = await this.shippingMethodModel.find({ enabled: true }).exec();
    
    // For now, return all enabled methods (simplified logic)
    // In a real application, you would implement country/region filtering
    return methods;
  }

  private calculateMethodCost(method: ShippingMethodDocument, packageDetails: any): number {
    // Use the cost property from the schema
    let cost = method.cost;
    
    // Add additional costs based on package details if needed
    // For now, just return the base cost
    return Math.max(0, cost);
  }
} 