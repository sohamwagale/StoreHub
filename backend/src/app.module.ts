import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { StoresModule } from './stores/stores.module.js';
import { RatingsModule } from './ratings/ratings.module.js';
import { SeedModule } from './seed/seed.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`[Database] No MONGODB_URI provided. Started MongoMemoryServer at: ${uri}`);
          } catch (err) {
            console.warn(
              '[Database] Could not start MongoMemoryServer, falling back to default localhost URI',
              err,
            );
            uri = 'mongodb://127.0.0.1:27017/shop-rating-platform';
          }
        } else {
          console.log(`[Database] Connecting to MongoDB using provided MONGODB_URI`);
        }
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StoresModule,
    RatingsModule,
    SeedModule,
  ],
})
export class AppModule {}
