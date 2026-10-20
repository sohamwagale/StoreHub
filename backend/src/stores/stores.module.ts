import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './schemas/store.schema.js';
import { Rating, RatingSchema } from '../ratings/schemas/rating.schema.js';
import { StoresService } from './stores.service.js';
import { StoresController } from './stores.controller.js';
import { OwnerController } from './owner.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
  ],
  controllers: [StoresController, OwnerController],
  providers: [StoresService],
  exports: [StoresService, MongooseModule],
})
export class StoresModule {}
