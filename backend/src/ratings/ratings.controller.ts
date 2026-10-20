import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RatingsService } from './ratings.service.js';
import { CreateRatingDto } from './dto/create-rating.dto.js';
import { UpdateRatingDto } from './dto/update-rating.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
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
  async getStoreReviews(@Param('storeId') storeId: string) {
    return this.ratingsService.getStoreReviews(storeId);
  }
}
