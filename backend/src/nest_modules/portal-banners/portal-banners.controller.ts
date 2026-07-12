import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { memoryStorage } from 'multer';
import { UserRole } from '../../core/users/domain/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PortalBannersService } from './portal-banners.service';
import { StorageService } from '../storage/storage.service';

type UploadedBannerImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

class SavePortalBannerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string;
}

class UpdatePortalBannerStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

@ApiTags('Banners')
@Controller('banners')
export class PortalBannersController {
  constructor(private readonly portalBannersService: PortalBannersService) {}

  @Get()
  listActive() {
    return this.portalBannersService.listActive();
  }

  @Get('active')
  getActive() {
    return this.portalBannersService.getActive();
  }
}

@ApiTags('Administração de banners')
@ApiBearerAuth()
@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AdminPortalBannersController {
  constructor(
    private readonly portalBannersService: PortalBannersService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  list() {
    return this.portalBannersService.list();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: SavePortalBannerDto,
    @UploadedFile() image: UploadedBannerImage | undefined,
  ) {
    if (!image) throw new Error('Banner image is required');
    const uploadedImage = await this.storageService.uploadPortalBannerImage(image);
    return this.portalBannersService.create({
      title: dto.title,
      linkUrl: dto.linkUrl,
      imagePath: uploadedImage.key,
      imageName: uploadedImage.originalName,
    });
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: SavePortalBannerDto,
    @UploadedFile() image: UploadedBannerImage | undefined,
  ) {
    const uploadedImage = image
      ? await this.storageService.uploadPortalBannerImage(image)
      : null;

    return this.portalBannersService.update(id, {
      title: dto.title,
      linkUrl: dto.linkUrl,
      ...(uploadedImage
        ? {
            imagePath: uploadedImage.key,
            imageName: uploadedImage.originalName,
          }
        : {}),
    });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePortalBannerStatusDto,
  ) {
    return this.portalBannersService.setActiveState(id, dto.isActive);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.portalBannersService.remove(id);
  }
}
