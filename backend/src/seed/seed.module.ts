import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { Store, StoreSchema } from '../stores/schemas/store.schema.js';
import { Rating, RatingSchema } from '../ratings/schemas/rating.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
