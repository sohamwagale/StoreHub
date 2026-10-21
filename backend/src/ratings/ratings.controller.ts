import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RatingsService } from './ratings.service.js';
import { CreateRatingDto } from './dto/create-rating.dto.js';
import { UpdateRatingDto } from './dto/update-rating.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/interfaces/user-role.enum.js';

@Controller()
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post('stores/:storeId/ratings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async createRating(
    @Param('storeId') storeId: string,
    @CurrentUser('id') userId: string,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.create(storeId, userId, createRatingDto);
  }

  @Patch('stores/:storeId/ratings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async updateRating(
    @Param('storeId') storeId: string,
    @CurrentUser('id') userId: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(storeId, userId, updateRatingDto);
  }

  @Delete('stores/:storeId/ratings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async deleteRating(
    @Param('storeId') storeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.delete(storeId, userId);
  }

  @Get('stores/:storeId/ratings/me')
  @UseGuards(JwtAuthGuard)
  async getMyRatingForStore(
    @Param('storeId') storeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.getMyRatingForStore(storeId, userId);
  }

  @Get('ratings/my-ratings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  async getMyRatings(@CurrentUser('id') userId: string) {
    return this.ratingsService.getMyRatings(userId);
  }

  @Get('stores/:storeId/reviews')
  @UseGuards(OptionalJwtAuthGuard)
  async getStoreReviews(
    @Param('storeId') storeId: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.ratingsService.getStoreReviews(storeId, currentUserId);
  }

  @Post('ratings/:id/vote')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async voteRating(
    @Param('id') ratingId: string,
    @CurrentUser('id') userId: string,
    @Body('type') type: 'LIKE' | 'DISLIKE',
  ) {
    if (!type || !['LIKE', 'DISLIKE'].includes(type)) {
      throw new BadRequestException("Vote type must be 'LIKE' or 'DISLIKE'");
    }
    return this.ratingsService.vote(ratingId, userId, type);
  }

  @Post('ratings/:id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async likeRating(
    @Param('id') ratingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.vote(ratingId, userId, 'LIKE');
  }

  @Post('ratings/:id/dislike')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async dislikeRating(
    @Param('id') ratingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.vote(ratingId, userId, 'DISLIKE');
  }

  @Post('ratings/:id/report')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async reportRating(
    @Param('id') ratingId: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ratingsService.reportReview(ratingId, userId, reason);
  }
}
