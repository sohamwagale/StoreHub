import { Injectable, Logger, BadRequestException, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Store, StoreDocument } from '../stores/schemas/store.schema.js';
import { Rating, RatingDocument } from '../ratings/schemas/rating.schema.js';

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
  private s3Region: string = 'ap-south-1';

  constructor(
    private configService: ConfigService,
    @Optional() @InjectModel(Store.name) private storeModel?: Model<StoreDocument>,
    @Optional() @InjectModel(Rating.name) private ratingModel?: Model<RatingDocument>,
  ) {
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
    const bucket =
      this.configService.get<string>('AWS_S3_BUCKET') ||
      this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

    if (accessKeyId && secretAccessKey && bucket) {
      try {
        this.s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId: accessKeyId.trim(),
            secretAccessKey: secretAccessKey.trim(),
          },
        });
        this.s3Bucket = bucket.trim();
        this.s3Region = region.trim();
        this.logger.log(`AWS S3 Client successfully initialized for bucket: ${this.s3Bucket} (${this.s3Region})`);

        // Automatically migrate existing local images to S3
        setTimeout(() => {
          this.migrateLocalUploadsToS3().catch((err) => {
            this.logger.error(`Initial S3 migration check error: ${err.message}`);
          });
        }, 1500);
      } catch (err) {
        this.logger.warn(`Failed to initialize S3 client, will fall back to local storage: ${err}`);
      }
    } else {
      this.logger.log(
        'AWS S3 credentials not fully configured. Using local filesystem storage for uploads. (Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in .env)',
      );
    }
  }

  /**
   * Migrate any existing local images in uploads/ to the S3 bucket and update DB references
   */
  async migrateLocalUploadsToS3(): Promise<{ migratedCount: number; updatedDbCount: number }> {
    if (!this.s3Client || !this.s3Bucket) {
      this.logger.warn('Cannot run S3 migration: S3 client is not configured.');
      return { migratedCount: 0, updatedDbCount: 0 };
    }

    let migratedCount = 0;
    let updatedDbCount = 0;

    try {
      if (!fs.existsSync(this.uploadsDir)) {
        return { migratedCount: 0, updatedDbCount: 0 };
      }

      const files = await fs.promises.readdir(this.uploadsDir);
      const imageFiles = files.filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
      });

      if (imageFiles.length === 0) {
        this.logger.log('No local images found needing migration to S3.');
        return { migratedCount: 0, updatedDbCount: 0 };
      }

      this.logger.log(`Found ${imageFiles.length} local file(s) to verify/migrate to AWS S3 bucket: ${this.s3Bucket}...`);

      const mimeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      };

      for (const fileName of imageFiles) {
        const localPath = path.join(this.uploadsDir, fileName);
        const fileBuffer = await fs.promises.readFile(localPath);
        const ext = path.extname(fileName).toLowerCase();
        const contentType = mimeMap[ext] || 'image/jpeg';
        const s3Key = `shops/${fileName}`;

        // Upload to AWS S3
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.s3Bucket,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: contentType,
          }),
        );

        const s3Url = `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${s3Key}`;
        migratedCount++;
        this.logger.log(`[S3 Migration] Uploaded local file ${fileName} -> ${s3Url}`);

        // Update Store photo URLs in MongoDB
        if (this.storeModel) {
          const stores = await this.storeModel.find({
            photos: { $elemMatch: { $regex: fileName } },
          });

          for (const s of stores) {
            let changed = false;
            s.photos = s.photos.map((p) => {
              if (p && p.includes(fileName) && !p.startsWith('https://')) {
                changed = true;
                return s3Url;
              }
              return p;
            });
            if (changed) {
              await s.save();
              updatedDbCount++;
              this.logger.log(`[S3 Migration] Updated Store "${s.name}" photos to use S3 URL.`);
            }
          }
        }

        // Update Rating photo URLs in MongoDB
        if (this.ratingModel) {
          const ratings = await this.ratingModel.find({
            photos: { $elemMatch: { $regex: fileName } },
          });

          for (const r of ratings) {
            let changed = false;
            r.photos = (r.photos || []).map((p) => {
              if (p && p.includes(fileName) && !p.startsWith('https://')) {
                changed = true;
                return s3Url;
              }
              return p;
            });
            if (changed) {
              await r.save();
              updatedDbCount++;
              this.logger.log(`[S3 Migration] Updated Rating ${r._id} photos to use S3 URL.`);
            }
          }
        }
      }

      this.logger.log(
        `[S3 Migration Complete] Successfully migrated ${migratedCount} image(s) to S3 bucket ${this.s3Bucket}. Updated ${updatedDbCount} database reference(s).`,
      );
    } catch (err: any) {
      this.logger.error(`S3 Migration error: ${err?.message || err}`);
    }

    return { migratedCount, updatedDbCount };
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

    // 1. Primary: Direct upload to AWS S3
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
        this.logger.log(`Successfully uploaded photo to AWS S3: ${s3Url}`);
        return s3Url;
      } catch (s3Error: any) {
        this.logger.error(`S3 upload failed: ${s3Error?.message || s3Error}`);
        this.logger.warn('Gracefully falling back to local file storage.');
      }
    }

    // 2. Fallback: Local filesystem storage
    this.ensureUploadsDir();
    const filePath = path.join(this.uploadsDir, cleanFileName);
    await fs.promises.writeFile(filePath, file.buffer);

    const relativeUrl = `/uploads/${cleanFileName}`;
    if (baseUrl) {
      return `${baseUrl.replace(/\/$/, '')}${relativeUrl}`;
    }
    return relativeUrl;
  }

  getS3Url(filename: string): string | null {
    if (!this.s3Bucket) return null;
    const safeName = path.basename(filename);
    return `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/shops/${safeName}`;
  }

  getLocalFilePath(filename: string): string | null {
    const safeName = path.basename(filename);
    const fullPath = path.join(this.uploadsDir, safeName);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    return null;
  }
}
