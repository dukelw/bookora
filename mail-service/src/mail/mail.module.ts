import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [MailProcessor, MailService],
})
export class MailModule {}
