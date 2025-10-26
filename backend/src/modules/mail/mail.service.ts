import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import bull from 'bull';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private readonly mailQueue: bull.Queue) {}

  async sendMail(dto: SendMailDto) {
    // Producer: đẩy job sang mail-service
    const job = await this.mailQueue.add('send', dto, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
      timeout: 30_000,
    });

    return { enqueued: true, jobId: job.id };
  }
}
