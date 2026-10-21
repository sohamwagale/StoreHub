import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findByIdSafe(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }

  @Get('dashboard-stats')
  async getDashboardStats(@CurrentUser('id') userId: string) {
    return this.usersService.getDashboardStats(userId);
  }

  @Get('bookmarks')
  async getBookmarks(@CurrentUser('id') userId: string) {
    return this.usersService.getBookmarks(userId);
  }

  @Post('bookmarks/:storeId')
  @HttpCode(HttpStatus.OK)
  async toggleBookmark(
    @Param('storeId') storeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.toggleBookmark(userId, storeId);
  }
}
