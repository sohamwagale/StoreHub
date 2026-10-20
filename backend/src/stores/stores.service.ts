import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store, StoreDocument } from './schemas/store.schema.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { Rating, RatingDocument } from '../ratings/schemas/rating.schema.js';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async create(createStoreDto: CreateStoreDto, ownerId: string): Promise<StoreDocument> {
    const store = new this.storeModel({
      name: createStoreDto.name.trim(),
      address: createStoreDto.address.trim(),
      category: createStoreDto.category ? createStoreDto.category.trim() : 'General',
      ownerId: new Types.ObjectId(ownerId),
    });
    return store.save();
  }

  async findAll(search?: string, category?: string, currentUserId?: string) {
    const filter: any = {};
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category.trim() && category.toLowerCase() !== 'all') {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    const stores = await this.storeModel.find(filter).sort({ createdAt: -1 }).lean().exec();

    // Calculate rating stats for each store using aggregation
    const storeIds = stores.map((s) => s._id);

    const ratingStats = await this.ratingModel.aggregate([
      { $match: { storeId: { $in: storeIds } } },
      {
        $group: {
          _id: '$storeId',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map<string, { averageRating: number; totalRatings: number }>();
    ratingStats.forEach((stat) => {
      statsMap.set(stat._id.toString(), {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        totalRatings: stat.totalRatings,
      });
    });

    let userRatingsMap = new Map<string, number>();
    if (currentUserId && Types.ObjectId.isValid(currentUserId)) {
      const userRatings = await this.ratingModel
        .find({
          userId: new Types.ObjectId(currentUserId),
          storeId: { $in: storeIds },
        })
        .lean()
        .exec();

      userRatings.forEach((ur) => {
        userRatingsMap.set(ur.storeId.toString(), ur.rating);
      });
    }

    return stores.map((store) => {
      const sId = store._id.toString();
      const stats = statsMap.get(sId);
      const userRating = userRatingsMap.get(sId) ?? null;

      return {
        id: sId,
        _id: sId,
        name: store.name,
        address: store.address,
        category: (store as any).category || 'General',
        ownerId: store.ownerId.toString(),
        averageRating: stats ? stats.averageRating : null,
        totalRatings: stats ? stats.totalRatings : 0,
        userRating,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
    });
  }

  async findById(id: string, currentUserId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Store not found');
    }

    const store = await this.storeModel.findById(id).lean().exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const storeObjectId = new Types.ObjectId(id);

    const ratingStats = await this.ratingModel.aggregate([
      { $match: { storeId: storeObjectId } },
      {
        $group: {
          _id: '$storeId',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const stats = ratingStats[0];
    let userRating: number | null = null;

    if (currentUserId && Types.ObjectId.isValid(currentUserId)) {
      const existing = await this.ratingModel
        .findOne({
          userId: new Types.ObjectId(currentUserId),
          storeId: storeObjectId,
        })
        .lean()
        .exec();

      if (existing) {
        userRating = existing.rating;
      }
    }

    return {
      id: store._id.toString(),
      _id: store._id.toString(),
      name: store.name,
      address: store.address,
      category: (store as any).category || 'General',
      ownerId: store.ownerId.toString(),
      averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : null,
      totalRatings: stats ? stats.totalRatings : 0,
      userRating,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  async getOwnerDashboard(ownerId: string) {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new ForbiddenException('Invalid owner ID');
    }

    const ownerObjectId = new Types.ObjectId(ownerId);
    const stores = await this.storeModel.find({ ownerId: ownerObjectId }).lean().exec();

    if (!stores || stores.length === 0) {
      return {
        stores: [],
        message: 'No stores registered under your account yet',
      };
    }

    const storeResults = await Promise.all(
      stores.map(async (store) => {
        const storeId = store._id;

        // Aggregate average and total
        const stats = await this.ratingModel.aggregate([
          { $match: { storeId } },
          {
            $group: {
              _id: '$storeId',
              averageRating: { $avg: '$rating' },
              totalRatings: { $sum: 1 },
            },
          },
        ]);

        const storeStats = stats[0] || { averageRating: null, totalRatings: 0 };

        // Fetch ratings with populated safe user information
        const ratings = await this.ratingModel
          .find({ storeId })
          .populate('userId', 'name email')
          .sort({ updatedAt: -1 })
          .lean()
          .exec();

        const formattedRatings = ratings.map((r: any) => ({
          id: r._id.toString(),
          rating: r.rating,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: r.userId
            ? {
                id: r.userId._id ? r.userId._id.toString() : r.userId.toString(),
                name: r.userId.name || 'Anonymous User',
                email: r.userId.email || 'N/A',
              }
            : {
                id: 'unknown',
                name: 'Deleted User',
                email: 'N/A',
              },
        }));

        return {
          id: storeId.toString(),
          _id: storeId.toString(),
          name: store.name,
          address: store.address,
          category: (store as any).category || 'General',
          averageRating:
            storeStats.averageRating !== null
              ? Math.round(storeStats.averageRating * 10) / 10
              : null,
          totalRatings: storeStats.totalRatings,
          ratings: formattedRatings,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
        };
      }),
    );

    return {
      stores: storeResults,
      // Provide primary store summary directly as required by spec:
      primaryStore: storeResults[0] ?? null,
    };
  }

  async count(): Promise<number> {
    return this.storeModel.countDocuments().exec();
  }
}
