import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StoresService } from './stores.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/interfaces/user-role.enum.js';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.storesService.findAll(search, category, currentUserId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.storesService.findById(id, currentUserId);
  }

  @Get(':id/gallery')
  async getGallery(@Param('id') id: string) {
    return this.storesService.getStoreGallery(id);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async addPhotos(
    @Param('id') id: string,
    @Body('photos') photos: string[],
  ) {
    const list = Array.isArray(photos) ? photos : [photos];
    return this.storesService.addPhotos(id, list);
  }

  @Delete(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  async deletePhoto(
    @Param('id') id: string,
    @Body('photoUrl') photoUrlFromBody: string,
    @Query('photoUrl') photoUrlFromQuery: string,
    @CurrentUser('id') ownerId: string,
  ) {
    const photoUrl = photoUrlFromBody || photoUrlFromQuery;
    return this.storesService.deletePhoto(id, photoUrl, ownerId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.storesService.create(createStoreDto, ownerId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: Partial<CreateStoreDto>,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.storesService.update(id, updateStoreDto, ownerId);
  }
}
