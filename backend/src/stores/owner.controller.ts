import { Controller, Get, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/interfaces/user-role.enum.js';

@Controller('owner')
export class OwnerController {
  constructor(private storesService: StoresService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  async getDashboard(@CurrentUser('id') ownerId: string) {
    return this.storesService.getOwnerDashboard(ownerId);
  }
}
