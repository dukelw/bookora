import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './upload/cloudinary/cloudinary.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CloudinaryModule],
})
export class AppModule {}
