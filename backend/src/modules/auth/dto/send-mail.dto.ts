export class SendMailDto {
  to: string;
  subject: string;
  content: string; // HTML content
  name?: string;
}
