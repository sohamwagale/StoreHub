import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('[Seed Error] No MONGODB_URI found in backend/.env');
  process.exit(1);
}

async function runSeed() {
  console.log(`[Seed Runner] Connecting to MongoDB Atlas...`);
  try {
    await mongoose.connect(uri!);
    console.log('[Seed Runner] Successfully connected to MongoDB Atlas!');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database instance unavailable');
    }

    const usersCol = db.collection('users');
    const storesCol = db.collection('stores');
    const ratingsCol = db.collection('ratings');

    console.log('[Seed Runner] Checking existing records...');
    // We can clean existing seed demo records or populate if empty
    const existingOwner = await usersCol.findOne({ email: 'owner@example.com' });
    if (existingOwner) {
      console.log('[Seed Runner] Cleaning previous seed data to ensure fresh categorized stores & reviews...');
      await usersCol.deleteMany({ email: { $in: ['owner@example.com', 'alice@example.com', 'bob@example.com'] } });
      await storesCol.deleteMany({ ownerId: existingOwner._id });
      await ratingsCol.deleteMany({});
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);

    // 1. Insert Owner & Users
    const ownerRes = await usersCol.insertOne({
      name: 'Store Owner Master User',
      email: 'owner@example.com',
      address: '789 Enterprise Blvd, Suite 100, San Francisco, CA',
      passwordHash,
      role: 'OWNER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const aliceRes = await usersCol.insertOne({
      name: 'Alice Verified Shopper One',
      email: 'alice@example.com',
      address: '101 Cherry Lane, Apt 4B, San Francisco, CA',
      passwordHash,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const bobRes = await usersCol.insertOne({
      name: 'Bob Enthusiast Reviewer Two',
      email: 'bob@example.com',
      address: '202 Maple Avenue, Unit 12, Seattle, WA',
      passwordHash,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('[Seed Runner] Created 1 Owner and 2 Users.');

    // 2. Insert Categorized Stores
    const ownerId = ownerRes.insertedId;
    const store1 = await storesCol.insertOne({
      name: 'Green Valley Organic Market',
      address: '123 Market St, San Francisco, CA',
      category: 'Grocery',
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const store2 = await storesCol.insertOne({
      name: 'Metro Grand Shopping Center',
      address: '800 Downtown Center Way, San Francisco, CA',
      category: 'Malls',
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const store3 = await storesCol.insertOne({
      name: 'Velvet & Thread Apparel Co.',
      address: '240 Fashion Avenue, Los Angeles, CA',
      category: 'Clothes',
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const store4 = await storesCol.insertOne({
      name: 'Urban Pulse Tech & Gadgets',
      address: '456 Innovation Blvd, Seattle, WA',
      category: 'Electronics',
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const store5 = await storesCol.insertOne({
      name: 'Sunrise Artisan Bakery & Cafe',
      address: '789 Harbor View Way, San Diego, CA',
      category: 'Bakery',
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('[Seed Runner] Created 5 categorized stores.');

    // 3. Insert Ratings & Reviews
    const aliceId = aliceRes.insertedId;
    const bobId = bobRes.insertedId;

    await ratingsCol.insertMany([
      {
        userId: aliceId,
        storeId: store1.insertedId,
        rating: 5,
        review: 'Exceptional organic selection, farm-fresh fruit and super clean layout. Highly recommended!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: bobId,
        storeId: store1.insertedId,
        rating: 4,
        review: 'Friendly staff, quick checkout, and great bulk nuts and granola section.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: aliceId,
        storeId: store2.insertedId,
        rating: 4,
        review: 'Huge modern shopping mall with fantastic dining terrace and premium boutique shops.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: bobId,
        storeId: store2.insertedId,
        rating: 5,
        review: 'Spotlessly clean facilities, plenty of EV charging parking, and all flagship brand stores under one roof.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: aliceId,
        storeId: store3.insertedId,
        rating: 5,
        review: 'Trendy and high quality apparel. The styling team was attentive without being pushy.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: bobId,
        storeId: store4.insertedId,
        rating: 4,
        review: 'Knowledgeable tech staff and competitive prices on the latest laptops and smart home gadgets.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: aliceId,
        storeId: store5.insertedId,
        rating: 5,
        review: 'Best artisan bakery in town! The sourdough bread and almond croissants melt in your mouth.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create unique compound index on userId + storeId
    await ratingsCol.createIndex({ userId: 1, storeId: 1 }, { unique: true });

    console.log('[Seed Runner] Successfully populated 7 ratings with verified reviews and compound index!');
    console.log('[Seed Runner] All sample data successfully seeded to MongoDB Atlas!');
  } catch (error) {
    console.error('[Seed Runner Error]', error);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed Runner] Disconnected from MongoDB.');
  }
}

runSeed();
