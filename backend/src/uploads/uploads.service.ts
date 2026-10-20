import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadsDir = path.resolve(process.cwd(), 'uploads');
  private s3Client: S3Client | null = null;
  private s3Bucket: string | null = null;
  private s3Region: string = 'us-east-1';

  constructor(private configService: ConfigService) {
    this.ensureUploadsDir();
    this.initS3();
  }

  private ensureUploadsDir() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        this.logger.log(`Created local uploads directory at ${this.uploadsDir}`);
      }
    } catch (err) {
      this.logger.error('Failed to create local uploads directory', err);
    }
  }

  private initS3() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    if (accessKeyId && secretAccessKey && bucket) {
      try {
        this.s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
        this.s3Bucket = bucket;
        this.s3Region = region;
        this.logger.log(`AWS S3 Client initialized for bucket: ${bucket} (${region})`);
      } catch (err) {
        this.logger.warn(`Failed to initialize S3 client, will fall back to local storage: ${err}`);
      }
    } else {
      this.logger.log(
        'AWS S3 credentials not fully configured. Using local filesystem storage for uploads. (S3 can be connected anytime via .env)',
      );
    }
  }

  async saveFile(file: MulterFile, baseUrl?: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type (${file.mimetype}). Allowed types: JPG, PNG, WEBP, GIF`,
      );
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const cleanFileName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;

    // 1. Try S3 if configured
    if (this.s3Client && this.s3Bucket) {
      try {
        const s3Key = `shops/${cleanFileName}`;
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.s3Bucket,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        const s3Url = `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${s3Key}`;
        this.logger.log(`Uploaded photo to AWS S3: ${s3Url}`);
        return s3Url;
      } catch (s3Error) {
        this.logger.warn(
          `S3 upload failed, gracefully falling back to local file storage: ${s3Error}`,
        );
      }
    }

    // 2. Local file storage fallback
    this.ensureUploadsDir();
    const filePath = path.join(this.uploadsDir, cleanFileName);
    await fs.promises.writeFile(filePath, file.buffer);

    const relativeUrl = `/uploads/${cleanFileName}`;
    if (baseUrl) {
      return `${baseUrl.replace(/\/$/, '')}${relativeUrl}`;
    }
    return relativeUrl;
  }

  getLocalFilePath(filename: string): string | null {
    // Prevent directory traversal
    const safeName = path.basename(filename);
    const fullPath = path.join(this.uploadsDir, safeName);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    return null;
  }
}
