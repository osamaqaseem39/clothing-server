import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingMethod, ShippingMethodDocument } from '../schemas/shipping-method.schema';
import { DeliveryCharge, DeliveryChargeDocument } from '../schemas/delivery-charge.schema';
import { CreateShippingMethodDto } from '../dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from '../dto/update-shipping-method.dto';
import { CreateDeliveryChargeDto } from '../dto/create-delivery-charge.dto';
import { UpdateDeliveryChargeDto } from '../dto/update-delivery-charge.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(ShippingMethod.name) private readonly shippingMethodModel: Model<ShippingMethodDocument>,
    @InjectModel(DeliveryCharge.name) private readonly deliveryChargeModel: Model<DeliveryChargeDocument>,
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
    const { shippingAddress, packageDetails, orderId, orderTotal } = calculateShippingDto;
    
    // First, try to find location-based delivery charge
    const deliveryCharge = await this.findDeliveryChargeForLocation(shippingAddress);
    
    // Get available shipping methods for the destination
    const availableMethods = await this.getAvailableMethodsForDestination(shippingAddress);
    
    if (availableMethods.length === 0 && !deliveryCharge) {
      throw new BadRequestException('No shipping methods available for this destination');
    }

    // Calculate costs for each method, using delivery charge if available
    const methodsWithCosts = availableMethods.map(method => {
      let cost = this.calculateMethodCost(method, packageDetails);
      
      // If delivery charge exists, use it instead or add to base cost
      if (deliveryCharge) {
        cost = this.calculateDeliveryCharge(deliveryCharge, packageDetails, orderTotal || 0);
      }
      
      return {
        methodId: method._id,
        name: method.name,
        cost,
        estimatedDays: deliveryCharge?.estimatedDeliveryDays || method.estimatedDeliveryDays || 3,
        description: method.description || '',
      };
    });

    // If we have delivery charge but no methods, create a default method
    if (deliveryCharge && methodsWithCosts.length === 0) {
      const cost = this.calculateDeliveryCharge(deliveryCharge, packageDetails, orderTotal || 0);
      methodsWithCosts.push({
        methodId: null,
        name: 'Standard Delivery',
        cost,
        estimatedDays: deliveryCharge.estimatedDeliveryDays || 3,
        description: `Delivery to ${deliveryCharge.locationName}`,
      });
    }

    // Sort by cost
    methodsWithCosts.sort((a, b) => a.cost - b.cost);

    return {
      availableMethods: methodsWithCosts,
      totalCost: methodsWithCosts.length > 0 ? methodsWithCosts[0].cost : 0,
      currency: 'PKR', // You might want to make this configurable
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

  // Delivery Charge Management Methods
  async createDeliveryCharge(createDeliveryChargeDto: CreateDeliveryChargeDto): Promise<DeliveryChargeDocument> {
    const deliveryCharge = new this.deliveryChargeModel(createDeliveryChargeDto);
    return await deliveryCharge.save();
  }

  async findAllDeliveryCharges(): Promise<DeliveryChargeDocument[]> {
    return await this.deliveryChargeModel.find().sort({ priority: -1, locationType: 1, locationName: 1 }).exec();
  }

  async findDeliveryChargeById(id: string): Promise<DeliveryChargeDocument> {
    const deliveryCharge = await this.deliveryChargeModel.findById(id).exec();
    if (!deliveryCharge) {
      throw new NotFoundException(`Delivery charge with ID ${id} not found`);
    }
    return deliveryCharge;
  }

  async updateDeliveryCharge(id: string, updateDeliveryChargeDto: UpdateDeliveryChargeDto): Promise<DeliveryChargeDocument> {
    await this.findDeliveryChargeById(id);

    const updatedCharge = await this.deliveryChargeModel.findByIdAndUpdate(
      id,
      updateDeliveryChargeDto,
      { new: true }
    ).exec();

    if (!updatedCharge) {
      throw new NotFoundException(`Delivery charge with ID ${id} not found`);
    }

    return updatedCharge;
  }

  async toggleDeliveryChargeStatus(id: string, enabled: boolean): Promise<DeliveryChargeDocument> {
    const deliveryCharge = await this.findDeliveryChargeById(id);
    deliveryCharge.enabled = enabled;
    return await deliveryCharge.save();
  }

  async deleteDeliveryCharge(id: string): Promise<void> {
    await this.findDeliveryChargeById(id);
    await this.deliveryChargeModel.findByIdAndDelete(id).exec();
  }

  async findDeliveryChargeForLocation(shippingAddress: any): Promise<DeliveryChargeDocument | null> {
    const { country, state, city, postalCode } = shippingAddress;
    
    // Build query conditions based on available address fields
    // Priority order: postal_code > city > state > country
    const queries = [];
    
    // Try to find by postal code first (most specific)
    if (postalCode) {
      queries.push({
        enabled: true,
        locationType: 'postal_code',
        country,
        postalCode: postalCode.trim(),
      });
    }
    
    // Try to find by city
    if (city) {
      queries.push({
        enabled: true,
        locationType: 'city',
        country,
        state: state || { $exists: false },
        city: city.trim(),
      });
    }
    
    // Try to find by state
    if (state) {
      queries.push({
        enabled: true,
        locationType: 'state',
        country,
        state: state.trim(),
        city: { $exists: false },
      });
    }
    
    // Try to find by country (least specific)
    queries.push({
      enabled: true,
      locationType: 'country',
      country,
      state: { $exists: false },
      city: { $exists: false },
    });
    
    // Execute queries in priority order and return first match
    for (const query of queries) {
      const charges = await this.deliveryChargeModel
        .find(query)
        .sort({ priority: -1 })
        .limit(1)
        .exec();
      
      if (charges.length > 0) {
        return charges[0];
      }
    }
    
    return null;
  }

  private calculateDeliveryCharge(
    deliveryCharge: DeliveryChargeDocument,
    packageDetails: any,
    orderTotal: number
  ): number {
    // Check if free shipping threshold is met
    if (deliveryCharge.freeShippingThreshold && orderTotal >= deliveryCharge.freeShippingThreshold) {
      return 0;
    }
    
    // Check minimum/maximum order amount constraints
    if (deliveryCharge.minimumOrderAmount && orderTotal < deliveryCharge.minimumOrderAmount) {
      return deliveryCharge.baseCharge;
    }
    
    if (deliveryCharge.maximumOrderAmount && orderTotal > deliveryCharge.maximumOrderAmount) {
      return deliveryCharge.baseCharge;
    }
    
    // Start with base charge
    let cost = deliveryCharge.baseCharge;
    
    // Add per kg charge if weight is provided
    if (deliveryCharge.chargePerKg && packageDetails?.weight) {
      cost += deliveryCharge.chargePerKg * packageDetails.weight;
    }
    
    // Add per item charge if item count is provided
    if (deliveryCharge.chargePerItem && packageDetails?.itemCount) {
      cost += deliveryCharge.chargePerItem * packageDetails.itemCount;
    }
    
    return Math.max(0, cost);
  }
} 