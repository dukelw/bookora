import { Processor, Process } from '@nestjs/bull';
import bull from 'bull';
import { Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';

@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {}

  @Process({ name: 'send', concurrency: 5 })
  async handleSend(job: bull.Job<SendMailDto>) {
    this.logger.log(
      `Processing job ${job.id} (attempt ${job.attemptsMade + 1}) to ${
        job.data.to
      }`,
    );
    const result = await this.mailService.send(job.data);
    this.logger.log(`Sent mail to ${job.data.to} (job ${job.id})`);
    return result;
  }
}
