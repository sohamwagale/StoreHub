import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './schemas/rating.schema.js';
import { RatingsService } from './ratings.service.js';
import { RatingsSocialService } from './ratings-social.service.js';
import { RatingsController } from './ratings.controller.js';
import { Store, StoreSchema } from '../stores/schemas/store.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Store.name, schema: StoreSchema },
    ]),
  ],
  controllers: [RatingsController],
  providers: [RatingsService, RatingsSocialService],
  exports: [RatingsService, RatingsSocialService, MongooseModule],
})
export class RatingsModule {}
