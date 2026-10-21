import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { RatingDocument } from './schemas/rating.schema.js';

@Injectable()
export class RatingsSocialService {
  async handleVote(
    ratingModel: Model<RatingDocument>,
    ratingId: string,
    userId: string,
    type: 'LIKE' | 'DISLIKE',
  ) {
    if (!Types.ObjectId.isValid(ratingId)) {
      throw new NotFoundException('Review not found');
    }

    const rating = await ratingModel.findById(ratingId).exec();
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
        rating.likes = rating.likes.filter((id) => id.toString() !== userId);
        userVote = null;
      } else {
        rating.likes.push(userObjId);
        rating.dislikes = rating.dislikes.filter((id) => id.toString() !== userId);
        userVote = 'LIKE';
      }
    } else if (type === 'DISLIKE') {
      if (dislikes.includes(userId)) {
        rating.dislikes = rating.dislikes.filter((id) => id.toString() !== userId);
        userVote = null;
      } else {
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

  async handleReport(
    ratingModel: Model<RatingDocument>,
    ratingId: string,
    userId: string,
    reason?: string,
  ) {
    if (!Types.ObjectId.isValid(ratingId)) {
      throw new NotFoundException('Review not found');
    }

    const rating = await ratingModel.findById(ratingId).exec();
    if (!rating) {
      throw new NotFoundException('Review not found');
    }

    if (!rating.reports) {
      rating.reports = [];
    }

    const alreadyReported = rating.reports.some(
      (rep) => rep.userId && rep.userId.toString() === userId,
    );

    if (alreadyReported) {
      return {
        success: true,
        message: 'You have already reported this review. Our moderation team is reviewing it.',
        reported: true,
      };
    }

    rating.reports.push({
      userId: new Types.ObjectId(userId),
      reason: reason ? reason.trim() : 'Inappropriate or fake review',
      createdAt: new Date(),
    });

    await rating.save();

    return {
      success: true,
      message: 'Review reported successfully. Our moderation team reviews flagged content within 24 hours.',
      reported: true,
    };
  }
}
