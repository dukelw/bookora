import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoDBService } from './mongodb.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const uri = cfg.get<string>('MONGODB_URI');
        console.log('🔌 Connecting MongoDB at:', uri);
        return { uri };
      },
    }),
  ],
  providers: [MongoDBService],
  exports: [MongoDBService],
})
export class MongoDBModule {}
