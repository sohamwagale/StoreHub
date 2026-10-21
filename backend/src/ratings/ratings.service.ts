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
import { RatingsSocialService } from './ratings-social.service.js';
import {
  formatRatingResponse,
  formatStoreReviews,
  formatMyRatings,
} from './ratings.formatter.js';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    private readonly socialService: RatingsSocialService,
  ) {}

  private async validateStore(storeId: string) {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new NotFoundException('Store not found');
    }
    const store = await this.storeModel.findById(storeId).exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async create(storeId: string, userId: string, createRatingDto: CreateRatingDto) {
    await this.validateStore(storeId);

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
        review: createRatingDto.review ? createRatingDto.review.trim() : '',
        photos: createRatingDto.photos || [],
      });

      const saved = await newRating.save();
      return formatRatingResponse(saved);
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
    await this.validateStore(storeId);

    const existing = await this.ratingModel.findOne({
      storeId: new Types.ObjectId(storeId),
      userId: new Types.ObjectId(userId),
    });

    if (!existing) {
      throw new NotFoundException('Rating not found for this store. Please submit a rating first.');
    }

    if (existing.userId.toString() !== userId) {
      throw new ForbiddenException('You cannot modify another user\'s rating');
    }

    existing.rating = updateRatingDto.rating;
    if (updateRatingDto.review !== undefined) {
      existing.review = updateRatingDto.review.trim();
    }
    if (updateRatingDto.photos !== undefined) {
      existing.photos = updateRatingDto.photos;
    }
    const saved = await existing.save();

    return formatRatingResponse(saved);
  }

  async delete(storeId: string, userId: string) {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new NotFoundException('Store not found');
    }

    const existing = await this.ratingModel.findOne({
      storeId: new Types.ObjectId(storeId),
      userId: new Types.ObjectId(userId),
    });

    if (!existing) {
      throw new NotFoundException('Rating not found for this store.');
    }

    await this.ratingModel.deleteOne({ _id: existing._id });
    return { success: true, message: 'Rating deleted successfully' };
  }

  async getStoreReviews(storeId: string, currentUserId?: string) {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new NotFoundException('Store not found');
    }

    const ratings = await this.ratingModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return formatStoreReviews(ratings, currentUserId);
  }

  async vote(ratingId: string, userId: string, type: 'LIKE' | 'DISLIKE') {
    return this.socialService.handleVote(this.ratingModel, ratingId, userId, type);
  }

  async reportReview(ratingId: string, userId: string, reason?: string) {
    return this.socialService.handleReport(this.ratingModel, ratingId, userId, reason);
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
      return { rating: null, review: '', photos: [] };
    }

    return formatRatingResponse(rating);
  }

  async getMyRatings(userId: string) {
    const ratings = await this.ratingModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('storeId', 'name address category photos')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return formatMyRatings(ratings);
  }

  async count(): Promise<number> {
    return this.ratingModel.countDocuments().exec();
  }
}
