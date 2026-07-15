import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { extname } from 'path';

type UploadedStorageFile = {
  key: string;
  originalName: string;
};

type UploadableFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

type StoredFile = {
  buffer: Buffer;
  contentType: string;
  filename: string;
};

@Injectable()
export class StorageService {
  private s3Client: S3Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  async uploadCommunicationCover(file: UploadableFile): Promise<UploadedStorageFile> {
    return this.uploadImage(file, 'communications');
  }

  async uploadPortalBannerImage(file: UploadableFile): Promise<UploadedStorageFile> {
    return this.uploadImage(file, 'portal-banners');
  }

  async uploadProfileImage(file: UploadableFile): Promise<UploadedStorageFile> {
    return this.uploadImage(file, 'profiles');
  }

  private async uploadImage(file: UploadableFile, folder: string): Promise<UploadedStorageFile> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Arquivo de imagem inválido.');
    }

    const normalizedMimeType = normalizeMimeType(file.mimetype);
    if (!normalizedMimeType) {
      throw new BadRequestException('Formato de imagem não suportado. Use JPG, PNG ou WEBP.');
    }

    const extension = normalizeExtension(file.originalname, normalizedMimeType);
    const optimizedBuffer = await optimizeImageBuffer(file.buffer, normalizedMimeType);
    const key = `${folder}/${randomUUID()}${extension}`;

    await this.uploadBuffer({
      key,
      buffer: optimizedBuffer,
      contentType: normalizedMimeType,
      filename: file.originalname,
    });

    return {
      key,
      originalName: file.originalname,
    };
  }

  async getFile(key: string): Promise<StoredFile> {
    const command = new GetObjectCommand({
      Bucket: this.getBucket(),
      Key: key,
    });

    let response;

    try {
      response = await this.getS3Client().send(command);
    } catch (error) {
      if (isStorageFileNotFound(error)) {
        throw new NotFoundException('Arquivo não encontrado no storage.');
      }

      throw error;
    }

    if (!response.Body) {
      throw new NotFoundException('Arquivo não encontrado no storage.');
    }

    const bytes = await response.Body.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      contentType: response.ContentType ?? 'application/octet-stream',
      filename: extractFilename(key),
    };
  }

  private async uploadBuffer({
    key,
    buffer,
    contentType,
    filename,
  }: {
    key: string;
    buffer: Buffer;
    contentType: string;
    filename: string;
  }) {
    const sanitizedFilename = sanitizeFilename(filename);
    const command = new PutObjectCommand({
      Bucket: this.getBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: `inline; filename="${sanitizedFilename}"`,
    });

    await this.getS3Client().send(command);
  }

  private getS3Client() {
    if (this.s3Client) return this.s3Client;

    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('SECRET_KEY');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException(
        'Storage AWS não configurado. Defina AWS_REGION, ACCESS_KEY e SECRET_KEY.',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return this.s3Client;
  }

  private getBucket() {
    const bucket = this.configService.get<string>('BUCKET_AWS');
    if (!bucket) {
      throw new InternalServerErrorException(
        'Bucket AWS não configurado. Defina BUCKET_AWS.',
      );
    }

    return bucket;
  }
}

async function optimizeImageBuffer(buffer: Buffer, mimeType: string) {
  const image = sharp(buffer).rotate();

  if (mimeType === 'image/png') {
    return image.png({ compressionLevel: 9, palette: true }).toBuffer();
  }

  if (mimeType === 'image/webp') {
    return image.webp({ quality: 82 }).toBuffer();
  }

  return image.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

function normalizeMimeType(mimeType: string) {
  if (mimeType === 'image/png') return 'image/png';
  if (mimeType === 'image/webp') return 'image/webp';
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'image/jpeg';
  return null;
}

function normalizeExtension(filename: string, mimeType: string) {
  const currentExtension = extname(filename).toLowerCase();
  if (currentExtension) {
    if (currentExtension === '.jpg' || currentExtension === '.jpeg') return '.jpg';
    if (currentExtension === '.png') return '.png';
    if (currentExtension === '.webp') return '.webp';
  }

  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  return '.jpg';
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function extractFilename(key: string) {
  const segments = key.split('/');
  return segments[segments.length - 1] || 'arquivo';
}

function isStorageFileNotFound(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const storageError = error as {
    name?: string;
    Code?: string;
    code?: string;
    $metadata?: {
      httpStatusCode?: number;
    };
  };

  return (
    storageError.name === 'NoSuchKey' ||
    storageError.Code === 'NoSuchKey' ||
    storageError.code === 'NoSuchKey' ||
    storageError.$metadata?.httpStatusCode === 404
  );
}
