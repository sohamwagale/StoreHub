import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
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
        review: createRatingDto.review ? createRatingDto.review.trim() : '',
        photos: createRatingDto.photos || [],
      });

      const saved = await newRating.save();
      return {
        id: saved._id.toString(),
        _id: saved._id.toString(),
        storeId: saved.storeId.toString(),
        userId: saved.userId.toString(),
        rating: saved.rating,
        review: saved.review || '',
        photos: saved.photos || [],
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
    if (updateRatingDto.review !== undefined) {
      existing.review = updateRatingDto.review.trim();
    }
    if (updateRatingDto.photos !== undefined) {
      existing.photos = updateRatingDto.photos;
    }
    const saved = await existing.save();

    return {
      id: saved._id.toString(),
      _id: saved._id.toString(),
      storeId: saved.storeId.toString(),
      userId: saved.userId.toString(),
      rating: saved.rating,
      review: saved.review || '',
      photos: saved.photos || [],
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
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

    return ratings.map((r: any) => {
      const likes = (r.likes || []).map((id: any) => id.toString());
      const dislikes = (r.dislikes || []).map((id: any) => id.toString());

      let userVote: 'LIKE' | 'DISLIKE' | null = null;
      if (currentUserId) {
        if (likes.includes(currentUserId)) {
          userVote = 'LIKE';
        } else if (dislikes.includes(currentUserId)) {
          userVote = 'DISLIKE';
        }
      }

      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        rating: r.rating,
        review: r.review || '',
        photos: r.photos || [],
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        userVote,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          id: r.userId?._id ? r.userId._id.toString() : (r.userId?.toString() || 'anonymous'),
          name: r.userId?.name || 'Verified Shopper',
        },
      };
    });
  }

  async vote(ratingId: string, userId: string, type: 'LIKE' | 'DISLIKE') {
    if (!Types.ObjectId.isValid(ratingId)) {
      throw new NotFoundException('Review not found');
    }

    const rating = await this.ratingModel.findById(ratingId).exec();
    if (!rating) {
      throw new NotFoundException('Review not found');
    }

    if (rating.userId.toString() === userId) {
      throw new BadRequestException('You cannot vote on your own review');
    }

    const userObjId = new Types.ObjectId(userId);
    if (!rating.likes) rating.likes = [];
    if (!rating.dislikes) rating.dislikes = [];

    const likes = rating.likes.map((id) => id.toString());
    const dislikes = rating.dislikes.map((id) => id.toString());

    let userVote: 'LIKE' | 'DISLIKE' | null = null;

    if (type === 'LIKE') {
      if (likes.includes(userId)) {
        // Toggle off
        rating.likes = rating.likes.filter((id) => id.toString() !== userId);
        userVote = null;
      } else {
        // Add like, remove from dislikes
        rating.likes.push(userObjId);
        rating.dislikes = rating.dislikes.filter((id) => id.toString() !== userId);
        userVote = 'LIKE';
      }
    } else if (type === 'DISLIKE') {
      if (dislikes.includes(userId)) {
        // Toggle off
        rating.dislikes = rating.dislikes.filter((id) => id.toString() !== userId);
        userVote = null;
      } else {
        // Add dislike, remove from likes
        rating.dislikes.push(userObjId);
        rating.likes = rating.likes.filter((id) => id.toString() !== userId);
        userVote = 'DISLIKE';
      }
    }

    await rating.save();

    return {
      ratingId: rating._id.toString(),
      likesCount: rating.likes.length,
      dislikesCount: rating.dislikes.length,
      userVote,
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
      return { rating: null, review: '', photos: [] };
    }

    return {
      id: rating._id.toString(),
      _id: rating._id.toString(),
      storeId: rating.storeId.toString(),
      userId: rating.userId.toString(),
      rating: rating.rating,
      review: rating.review || '',
      photos: rating.photos || [],
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }

  async getMyRatings(userId: string) {
    const ratings = await this.ratingModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('storeId', 'name address category photos')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return ratings.map((r: any) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      rating: r.rating,
      review: r.review || '',
      photos: r.photos || [],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      store: r.storeId
        ? {
            id: r.storeId._id ? r.storeId._id.toString() : r.storeId.toString(),
            name: r.storeId.name,
            address: r.storeId.address,
            category: r.storeId.category || 'General',
            photos: r.storeId.photos || [],
          }
        : null,
    }));
  }

  async count(): Promise<number> {
    return this.ratingModel.countDocuments().exec();
  }
}
