import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsService } from './uploads.service.js';
import { UploadsController } from './uploads.controller.js';
import { Store, StoreSchema } from '../stores/schemas/store.schema.js';
import { Rating, RatingSchema } from '../ratings/schemas/rating.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
