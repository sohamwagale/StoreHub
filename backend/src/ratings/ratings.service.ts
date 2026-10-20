import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema.js';
import { Store, StoreDocument } from '../stores/schemas/store.schema.js';
import { CreateRatingDto } from './dto/create-rating.dto.js';
import { UpdateRatingDto } from './dto/update-rating.dto.js';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  async create(storeId: string, userId: string, createRatingDto: CreateRatingDto) {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new NotFoundException('Store not found');
    }

    const store = await this.storeModel.findById(storeId).exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if user already rated this store
    const existing = await this.ratingModel.findOne({
      storeId: new Types.ObjectId(storeId),
      userId: new Types.ObjectId(userId),
    });

    if (existing) {
      throw new ConflictException(
        'You have already rated this store. Please update your existing rating instead.',
      );
    }

    try {
      const newRating = new this.ratingModel({
        storeId: new Types.ObjectId(storeId),
        userId: new Types.ObjectId(userId),
        rating: createRatingDto.rating,
      });

      const saved = await newRating.save();
      return {
        id: saved._id.toString(),
        _id: saved._id.toString(),
        storeId: saved.storeId.toString(),
        userId: saved.userId.toString(),
        rating: saved.rating,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          'You have already rated this store. Please update your existing rating instead.',
        );
      }
      throw err;
    }
  }

  async update(storeId: string, userId: string, updateRatingDto: UpdateRatingDto) {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new NotFoundException('Store not found');
    }

    const store = await this.storeModel.findById(storeId).exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const existing = await this.ratingModel.findOne({
      storeId: new Types.ObjectId(storeId),
      userId: new Types.ObjectId(userId),
    });

    if (!existing) {
      throw new NotFoundException('Rating not found for this store. Please submit a rating first.');
    }

    // Verify ownership
    if (existing.userId.toString() !== userId) {
      throw new ForbiddenException('You cannot modify another user\'s rating');
    }

    existing.rating = updateRatingDto.rating;
    const saved = await existing.save();

    return {
      id: saved._id.toString(),
      _id: saved._id.toString(),
      storeId: saved.storeId.toString(),
      userId: saved.userId.toString(),
      rating: saved.rating,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async getMyRatingForStore(storeId: string, userId: string) {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new NotFoundException('Store not found');
    }

    const rating = await this.ratingModel.findOne({
      storeId: new Types.ObjectId(storeId),
      userId: new Types.ObjectId(userId),
    });

    if (!rating) {
      return { rating: null };
    }

    return {
      id: rating._id.toString(),
      _id: rating._id.toString(),
      storeId: rating.storeId.toString(),
      userId: rating.userId.toString(),
      rating: rating.rating,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }

  async getMyRatings(userId: string) {
    const ratings = await this.ratingModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('storeId', 'name address')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return ratings.map((r: any) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      store: r.storeId
        ? {
            id: r.storeId._id ? r.storeId._id.toString() : r.storeId.toString(),
            name: r.storeId.name,
            address: r.storeId.address,
          }
        : null,
    }));
  }

  async count(): Promise<number> {
    return this.ratingModel.countDocuments().exec();
  }
}
