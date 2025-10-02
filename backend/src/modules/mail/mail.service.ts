import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS);
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(dto: SendMailDto) {
    try {
      const greeting = dto.name ? `Gửi anh/chị ${dto.name},<br><br>` : '';

      const mailOptions = {
        from: `"Bookora Store" <${process.env.SMTP_FROM}>`,
        to: dto.to,
        subject: dto.subject,
        html: `${greeting}${dto.content}`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { message: 'Mail sent successfully', info };
    } catch (err) {
      throw new InternalServerErrorException('Failed to send email: ' + err.message);
    }
  }
}
