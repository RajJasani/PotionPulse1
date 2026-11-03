import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserRole, StockMovementType } from '@potionpulse/contracts';

import { User, UserDocument } from '../users/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { Membership, MembershipDocument } from '../tenants/schemas/membership.schema';
import { Location, LocationDocument } from '../inventory/schemas/location.schema';
import { Ingredient, IngredientDocument } from '../ingredients/schemas/ingredient.schema';
import { InventoryBalance, InventoryBalanceDocument } from '../inventory/schemas/inventory-balance.schema';
import { StockMovement, StockMovementDocument } from '../movements/schemas/stock-movement.schema';
import { DemandEvent, DemandEventDocument } from '../events/schemas/demand-event.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>,
    @InjectModel(InventoryBalance.name) private balanceModel: Model<InventoryBalanceDocument>,
    @InjectModel(StockMovement.name) private movementModel: Model<StockMovementDocument>,
    @InjectModel(DemandEvent.name) private eventModel: Model<DemandEventDocument>,
  ) {}

  async seedDemoData(): Promise<void> {
    const demoEmail = 'hexley@potionpulse.dev';
    const existing = await this.userModel.findOne({ email: demoEmail });

    if (existing) {
      this.logger.log(`Demo user [${demoEmail}] already exists. Skipping initial seed.`);
      return;
    }

    this.logger.log(`Seeding demo workspace for Madam Hexley [${demoEmail}]...`);

    // 1. Create Madam Hexley User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('HexleyMagic2026!', salt);

    const user = await this.userModel.create({
      email: demoEmail,
      displayName: 'Madam Hexley',
      passwordHash,
      isSuperAdmin: true,
      status: 'active',
    });

    // 2. Create Tenant Shop
    const tenant = await this.tenantModel.create({
      name: "Madam Hexley's Apothecary",
      slug: 'madam-hexleys-apothecary',
      timezone: 'UTC',
      currency: 'USD',
      unitSystem: 'metric',
      settings: {
        allowNegativeStock: false,
        defaultSafetyStockDays: 7,
      },
    });

    // 3. Create Owner Membership
    await this.membershipModel.create({
      userId: user._id,
      tenantId: tenant._id,
      role: UserRole.OWNER,
      status: 'active',
    });

    // 4. Create Locations
    const mainShelf = await this.locationModel.create({
      tenantId: tenant._id,
      name: 'Main Shelf A',
      code: 'SHELF-A1',
      type: 'shelf',
      isDefault: true,
    });

    const coldVault = await this.locationModel.create({
      tenantId: tenant._id,
      name: 'Cold Storage Vault',
      code: 'COLD-V1',
      type: 'storage',
      isDefault: false,
    });

    const herbalRack = await this.locationModel.create({
      tenantId: tenant._id,
      name: 'Herbal Drying Rack',
      code: 'RACK-H1',
      type: 'shelf',
      isDefault: false,
    });

    // 5. Seed Core Catalog Ingredients
    const seedCatalog = [
      {
        name: 'Bat Wings',
        sku: 'ING-BAT-001',
        category: 'Animal',
        baseUnit: 'pcs',
        costPerUnit: 1.5,
        reorderPoint: 20,
        safetyStock: 10,
        leadTimeDays: 2,
        initialStock: 45,
        locationId: mainShelf._id,
      },
      {
        name: 'Mandrake Root',
        sku: 'ING-MAN-002',
        category: 'Botanical',
        baseUnit: 'g',
        costPerUnit: 2.0,
        reorderPoint: 50,
        safetyStock: 25,
        leadTimeDays: 4,
        initialStock: 120,
        locationId: herbalRack._id,
      },
      {
        name: 'Ghost Pepper',
        sku: 'ING-GHP-003',
        category: 'Botanical',
        baseUnit: 'g',
        costPerUnit: 0.8,
        reorderPoint: 40,
        safetyStock: 15,
        leadTimeDays: 3,
        initialStock: 85,
        locationId: herbalRack._id,
      },
      {
        name: 'Dragon Scale',
        sku: 'ING-DRG-004',
        category: 'Mineral',
        baseUnit: 'pcs',
        costPerUnit: 12.0,
        reorderPoint: 10,
        safetyStock: 5,
        leadTimeDays: 7,
        initialStock: 15,
        locationId: coldVault._id,
      },
      {
        name: 'Phoenix Feather',
        sku: 'ING-PHX-005',
        category: 'Animal',
        baseUnit: 'pcs',
        costPerUnit: 25.0,
        reorderPoint: 5,
        safetyStock: 3,
        leadTimeDays: 14,
        initialStock: 8,
        locationId: coldVault._id,
      },
      {
        name: 'Moon Water',
        sku: 'ING-MOO-006',
        category: 'Liquid',
        baseUnit: 'ml',
        costPerUnit: 0.5,
        reorderPoint: 150,
        safetyStock: 80,
        leadTimeDays: 2,
        initialStock: 500,
        locationId: mainShelf._id,
      },
      {
        name: 'Nightshade Petals',
        sku: 'ING-NGH-007',
        category: 'Botanical',
        baseUnit: 'g',
        costPerUnit: 1.1,
        reorderPoint: 30,
        safetyStock: 15,
        leadTimeDays: 3,
        initialStock: 60,
        locationId: herbalRack._id,
      },
      {
        name: 'Stardust Essence',
        sku: 'ING-STD-008',
        category: 'Mineral',
        baseUnit: 'ml',
        costPerUnit: 4.5,
        reorderPoint: 15,
        safetyStock: 8,
        leadTimeDays: 5,
        initialStock: 25,
        locationId: coldVault._id,
      },
    ];

    const seededIngredientIds: Types.ObjectId[] = [];

    for (const item of seedCatalog) {
      const ing = await this.ingredientModel.create({
        tenantId: tenant._id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        baseUnit: item.baseUnit,
        costPerUnit: item.costPerUnit,
        reorderPoint: item.reorderPoint,
        safetyStock: item.safetyStock,
        leadTimeDays: item.leadTimeDays,
        defaultLocationId: item.locationId,
      });

      seededIngredientIds.push(ing._id as Types.ObjectId);

      // Create initial stock balance
      await this.balanceModel.create({
        tenantId: tenant._id,
        ingredientId: ing._id,
        locationId: item.locationId,
        onHand: item.initialStock,
        reserved: 0,
        version: 1,
      });

      // Record immutable double-entry stock receipt movement
      await this.movementModel.create({
        tenantId: tenant._id,
        ingredientId: ing._id,
        locationId: item.locationId,
        type: StockMovementType.RECEIPT,
        quantityDelta: item.initialStock,
        unit: item.baseUnit,
        balanceAfter: item.initialStock,
        reason: 'Initial Apothecary Stock Opening Balance',
        referenceType: 'initial_seed',
        actorId: user._id,
      });
    }

    // 6. Seed Midnight Curse Demand Event (Bat Wings, Mandrake Root, Ghost Pepper)
    const curseIngredientIds = seededIngredientIds.slice(0, 3);
    const startAt = new Date();
    startAt.setDate(startAt.getDate() - 2);
    const endAt = new Date();
    endAt.setDate(endAt.getDate() + 12);

    await this.eventModel.create({
      tenantId: tenant._id,
      name: 'The Midnight Curse',
      description: 'Official seasonal full-moon surge scenario. Bat Wings, Mandrake Root, and Ghost Pepper demand multiplied by 3.0.',
      startAt,
      endAt,
      multiplier: 3.0,
      ingredientIds: curseIngredientIds,
      status: 'active',
    });

    this.logger.log(`Successfully seeded Madam Hexley demo workspace with ${seedCatalog.length} ingredients and active Midnight Curse event.`);
  }
}
