import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findByIdSafe(userId);
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
