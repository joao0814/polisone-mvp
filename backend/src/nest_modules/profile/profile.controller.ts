import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

type UploadedProfileImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@ApiTags('Meu perfil e campanha')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  get(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.profileService.get(currentUser.sub);
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() photo: UploadedProfileImage | undefined,
  ) {
    const uploadedPhoto = photo
      ? await this.storageService.uploadProfileImage(photo)
      : null;

    return this.profileService.update(currentUser.sub, {
      ...dto,
      ...(uploadedPhoto ? { profileImagePath: uploadedPhoto.key } : {}),
    });
  }
}
