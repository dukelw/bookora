import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/upload/cloudinary/cloudinary.module';
import { MongoDBModule } from './modules/databases/mongodb/mongodb.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongoDBModule,
    UserModule,
    AuthModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
