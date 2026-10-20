import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { Store, StoreDocument } from '../stores/schemas/store.schema.js';
import { Rating, RatingDocument } from '../ratings/schemas/rating.schema.js';
import { UserRole } from '../common/interfaces/user-role.enum.js';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedData();
  }

  async seedData() {
    try {
      const existingOwner = await this.userModel.findOne({ email: 'owner@example.com' });
      if (existingOwner) {
        this.logger.log('Seed data already present. Skipping auto-seeding.');
        return;
      }

      this.logger.log('Seeding initial demonstration data...');

      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('Password@123', salt);

      // 1. Create Owner
      const owner = await this.userModel.create({
        name: 'Store Owner Master User',
        email: 'owner@example.com',
        address: '789 Enterprise Blvd, Suite 100, San Francisco, CA',
        passwordHash: defaultPasswordHash,
        role: UserRole.OWNER,
      });

      // 2. Create Normal Users
      const alice = await this.userModel.create({
        name: 'Alice Verified Shopper One',
        email: 'alice@example.com',
        address: '101 Cherry Lane, Apt 4B, San Francisco, CA',
        passwordHash: defaultPasswordHash,
        role: UserRole.USER,
      });

      const bob = await this.userModel.create({
        name: 'Bob Enthusiast Reviewer Two',
        email: 'bob@example.com',
        address: '202 Maple Avenue, Unit 12, Seattle, WA',
        passwordHash: defaultPasswordHash,
        role: UserRole.USER,
      });

      // 3. Create Stores owned by Owner
      const store1 = await this.storeModel.create({
        name: 'Green Valley Organic Market',
        address: '123 Market St, San Francisco, CA',
        ownerId: owner._id,
      });

      const store2 = await this.storeModel.create({
        name: 'Urban Pulse Tech & Coffee',
        address: '456 Innovation Blvd, Seattle, WA',
        ownerId: owner._id,
      });

      const store3 = await this.storeModel.create({
        name: 'Sunrise Artisan Bakery & Deli',
        address: '789 Harbor View Way, San Diego, CA',
        ownerId: owner._id,
      });

      // 4. Create Ratings
      await this.ratingModel.create([
        {
          userId: alice._id,
          storeId: store1._id,
          rating: 5,
        },
        {
          userId: bob._id,
          storeId: store1._id,
          rating: 4,
        },
        {
          userId: alice._id,
          storeId: store2._id,
          rating: 4,
        },
        {
          userId: bob._id,
          storeId: store2._id,
          rating: 5,
        },
      ]);

      this.logger.log('Demonstration seed data successfully populated!');
    } catch (error) {
      this.logger.error('Failed to seed initial data:', error);
    }
  }
}
