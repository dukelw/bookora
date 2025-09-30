import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FooterImage, FooterImageSchema } from 'src/schemas/footer-image.schema';
import { FooterImageService } from './footer-image.service';
import { FooterImageController } from './footer-image.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FooterImage.name, schema: FooterImageSchema }])],
  controllers: [FooterImageController],
  providers: [FooterImageService],
})
export class FooterImageModule {}
