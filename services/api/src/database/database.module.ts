import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { Membership, MembershipSchema } from '../tenants/schemas/membership.schema';
import { Location, LocationSchema } from '../inventory/schemas/location.schema';
import { Ingredient, IngredientSchema } from '../ingredients/schemas/ingredient.schema';
import { InventoryBalance, InventoryBalanceSchema } from '../inventory/schemas/inventory-balance.schema';
import { StockMovement, StockMovementSchema } from '../movements/schemas/stock-movement.schema';
import { DemandEvent, DemandEventSchema } from '../events/schemas/demand-event.schema';

let memoryServer: any = null;

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        let uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          try {
            logger.log('No MONGODB_URI configured. Starting in-memory MongoDB server...');
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            memoryServer = await MongoMemoryServer.create();
            uri = memoryServer.getUri();
            logger.log(`In-memory MongoDB server started at: ${uri}`);
          } catch (e: any) {
            logger.warn(`Failed to start MongoMemoryServer: ${e.message}`);
            uri = 'mongodb://localhost:27017/potionpulse';
          }
        }

        const targetUri = uri || 'mongodb://localhost:27017/potionpulse';
        logger.log(`Connecting to MongoDB (target: ${targetUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')})`);
        return {
          uri: targetUri,
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Ingredient.name, schema: IngredientSchema },
      { name: InventoryBalance.name, schema: InventoryBalanceSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: DemandEvent.name, schema: DemandEventSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [MongooseModule, SeedService],
})
export class DatabaseModule implements OnApplicationBootstrap {
  private readonly logger = new Logger('DatabaseModule');

  constructor(private readonly seedService: SeedService) {}

  async onApplicationBootstrap() {
    this.logger.log('Executing database bootstrap and demo seeding...');
    await this.seedService.seedDemoData();
  }
}
