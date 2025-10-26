import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [BullModule.registerQueue({ name: 'mail' })],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
