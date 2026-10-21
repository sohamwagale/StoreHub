import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema.js';
import { Store, StoreDocument } from '../stores/schemas/store.schema.js';
import { Rating, RatingDocument } from '../ratings/schemas/rating.schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserRole } from '../common/interfaces/user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<UserDocument, 'passwordHash'>> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase().trim(),
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel({
      name: createUserDto.name.trim(),
      email: createUserDto.email.toLowerCase().trim(),
      address: createUserDto.address.trim(),
      passwordHash,
      role: createUserDto.role || UserRole.USER,
    });

    const saved = await createdUser.save();
    const userObj = saved.toObject();
    delete (userObj as any).passwordHash;
    return userObj;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdSafe(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as any;
  }

  async toggleBookmark(userId: string, storeId: string) {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new NotFoundException('Store not found');
    }

    const store = await this.storeModel.findById(storeId).exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.bookmarks) {
      user.bookmarks = [];
    }

    let isBookmarked = false;
    if (user.bookmarks.includes(storeId)) {
      user.bookmarks = user.bookmarks.filter((id) => id !== storeId);
      isBookmarked = false;
    } else {
      user.bookmarks.push(storeId);
      isBookmarked = true;
    }

    await user.save();

    return {
      isBookmarked,
      bookmarks: user.bookmarks,
      storeId,
    };
  }

  async getBookmarks(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const bookmarkIds = (user.bookmarks || [])
      .filter((id: string) => Types.ObjectId.isValid(id))
      .map((id: string) => new Types.ObjectId(id));

    if (bookmarkIds.length === 0) {
      return [];
    }

    const stores = await this.storeModel
      .find({ _id: { $in: bookmarkIds } })
      .lean()
      .exec();

    // Calculate rating stats for each bookmarked store
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

    const userRatings = await this.ratingModel
      .find({
        userId: new Types.ObjectId(userId),
        storeId: { $in: storeIds },
      })
      .lean()
      .exec();

    const userRatingsMap = new Map<string, number>();
    userRatings.forEach((ur) => {
      userRatingsMap.set(ur.storeId.toString(), ur.rating);
    });

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
        latitude: (store as any).latitude ?? 40.7128,
        longitude: (store as any).longitude ?? -74.0060,
        photos: (store as any).photos || [],
        description: (store as any).description || '',
        phone: (store as any).phone || '',
        website: (store as any).website || '',
        openingHours: (store as any).openingHours || '',
        ownerId: store.ownerId.toString(),
        averageRating: stats ? stats.averageRating : null,
        totalRatings: stats ? stats.totalRatings : 0,
        userRating,
        isBookmarked: true,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
    });
  }

  async getDashboardStats(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userObjId = new Types.ObjectId(userId);
    const ratings = await this.ratingModel
      .find({ userId: userObjId })
      .select('rating likes dislikes storeId createdAt')
      .lean()
      .exec();

    const totalRatings = ratings.length;
    const totalHelpfulVotes = ratings.reduce(
      (sum, r: any) => sum + (Array.isArray(r.likes) ? r.likes.length : 0),
      0,
    );
    const totalBookmarks = Array.isArray(user.bookmarks) ? user.bookmarks.length : 0;
    const averageRatingGiven =
      totalRatings > 0
        ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings) * 10) / 10
        : 0;

    let reviewerRank = 'Level 1 Explorer';
    if (totalRatings >= 10 || totalHelpfulVotes >= 25) {
      reviewerRank = 'Level 4 Master Reviewer';
    } else if (totalRatings >= 5 || totalHelpfulVotes >= 10) {
      reviewerRank = 'Level 3 Connoisseur';
    } else if (totalRatings >= 2 || totalHelpfulVotes >= 3) {
      reviewerRank = 'Level 2 Contributor';
    }

    const reputationScore = totalRatings * 25 + totalHelpfulVotes * 10;

    return {
      totalRatings,
      totalHelpfulVotes,
      totalBookmarks,
      bookmarkedCount: totalBookmarks,
      averageRatingGiven,
      reviewerRank,
      reputationScore,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        bookmarks: user.bookmarks || [],
        createdAt: user.createdAt,
      },
    };
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }
}
