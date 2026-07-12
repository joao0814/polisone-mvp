import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from './storage.service';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get(':scope/:filename')
  async getFile(
    @Param('scope') scope: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const file = await this.storageService.getFile(`${scope}/${filename}`);

    response.setHeader('Content-Type', file.contentType);
    response.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    response.send(file.buffer);
  }
}
