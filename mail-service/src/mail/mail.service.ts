import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: Number(this.config.get<number>('SMTP_PORT') || 587),
      secure:
        this.config.get<string>('SMTP_SECURE') === 'true' ||
        Number(this.config.get<number>('SMTP_PORT')) === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async send(dto: SendMailDto) {
    try {
      const greeting = dto.name ? `Gửi anh/chị ${dto.name},<br><br>` : '';
      const from = this.config.get('SMTP_FROM') || this.config.get('SMTP_USER');

      const info = await this.transporter.sendMail({
        from: `"Bookora Store" <${from}>`,
        to: dto.to,
        subject: dto.subject,
        html: `${greeting}${dto.content}`,
      });

      return { message: 'Mail sent successfully', info };
    } catch (err: any) {
      throw new InternalServerErrorException(
        'Failed to send email: ' + err.message,
      );
    }
  }
}
