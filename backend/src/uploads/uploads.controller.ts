import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Req,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { UploadsService } from './uploads.service.js';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: any[],
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Please provide at least one image file');
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const urls = await Promise.all(
      files.map((file) => this.uploadsService.saveFile(file, baseUrl)),
    );

    return {
      urls,
      url: urls[0],
      count: urls.length,
    };
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: any,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Please provide an image file');
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const url = await this.uploadsService.saveFile(file, baseUrl);
    return { url, urls: [url] };
  }

  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.uploadsService.getLocalFilePath(filename);
    if (filePath) {
      return res.sendFile(filePath);
    }
    const s3Url = this.uploadsService.getS3Url(filename);
    if (s3Url) {
      return res.redirect(302, s3Url);
    }
    throw new NotFoundException('Image not found');
  }

  @Post('migrate-to-s3')
  async triggerMigration() {
    return this.uploadsService.migrateLocalUploadsToS3();
  }
}
