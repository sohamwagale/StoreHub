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

      // 3. Create Stores owned by Owner with categories, coordinates, and photos
      const store1 = await this.storeModel.create({
        name: 'Green Valley Organic Market',
        address: '123 Market St, San Francisco, CA',
        category: 'Grocery',
        latitude: 37.7937,
        longitude: -122.3965,
        photos: [
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
        ],
        ownerId: owner._id,
      });

      const store2 = await this.storeModel.create({
        name: 'Metro Grand Shopping Center',
        address: '800 Downtown Center Way, San Francisco, CA',
        category: 'Malls',
        latitude: 37.7845,
        longitude: -122.4070,
        photos: [
          'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=1200&q=80',
        ],
        ownerId: owner._id,
      });

      const store3 = await this.storeModel.create({
        name: 'Velvet & Thread Apparel Co.',
        address: '240 Fashion Avenue, San Francisco, CA',
        category: 'Clothes',
        latitude: 37.7885,
        longitude: -122.4042,
        photos: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        ],
        ownerId: owner._id,
      });

      const store4 = await this.storeModel.create({
        name: 'Urban Pulse Tech & Gadgets',
        address: '456 Innovation Blvd, San Francisco, CA',
        category: 'Electronics',
        latitude: 37.7792,
        longitude: -122.3995,
        photos: [
          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        ],
        ownerId: owner._id,
      });

      const store5 = await this.storeModel.create({
        name: 'Sunrise Artisan Bakery & Cafe',
        address: '789 Harbor View Way, San Francisco, CA',
        category: 'Bakery',
        latitude: 37.8080,
        longitude: -122.4177,
        photos: [
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
        ],
        ownerId: owner._id,
      });

      // 4. Create Ratings & Reviews with customer photos
      await this.ratingModel.create([
        {
          userId: alice._id,
          storeId: store1._id,
          rating: 5,
          review: 'Exceptional organic selection, farm-fresh fruit and super clean layout. Highly recommended!',
          photos: [
            'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
          ],
        },
        {
          userId: bob._id,
          storeId: store1._id,
          rating: 4,
          review: 'Friendly staff, quick checkout, and great bulk nuts and granola section.',
          photos: [],
        },
        {
          userId: alice._id,
          storeId: store2._id,
          rating: 4,
          review: 'Huge modern shopping mall with fantastic dining terrace and premium boutique shops.',
          photos: [],
        },
        {
          userId: bob._id,
          storeId: store2._id,
          rating: 5,
          review: 'Spotlessly clean facilities, plenty of EV charging parking, and all flagship brand stores under one roof.',
          photos: [
            'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
          ],
        },
        {
          userId: alice._id,
          storeId: store3._id,
          rating: 5,
          review: 'Trendy and high quality apparel. The styling team was attentive without being pushy.',
          photos: [],
        },
        {
          userId: bob._id,
          storeId: store4._id,
          rating: 4,
          review: 'Knowledgeable tech staff and competitive prices on the latest laptops and smart home gadgets.',
          photos: [],
        },
        {
          userId: alice._id,
          storeId: store5._id,
          rating: 5,
          review: 'Best artisan bakery in town! The sourdough bread and almond croissants melt in your mouth.',
          photos: [
            'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80',
          ],
        },
      ]);

      this.logger.log('Demonstration seed data successfully populated!');
    } catch (error) {
      this.logger.error('Failed to seed initial data:', error);
    }
  }
}
