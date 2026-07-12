import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import {
  AdminPortalBannersController,
  PortalBannersController,
} from './portal-banners.controller';
import { PortalBannerModel } from './portal-banner.model';
import { PortalBannersService } from './portal-banners.service';

@Module({
  imports: [AuthModule, StorageModule, SequelizeModule.forFeature([PortalBannerModel])],
  controllers: [PortalBannersController, AdminPortalBannersController],
  providers: [PortalBannersService],
  exports: [PortalBannersService],
})
export class PortalBannersModule {}
