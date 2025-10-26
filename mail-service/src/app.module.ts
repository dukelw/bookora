import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST') || '127.0.0.1',
          port: parseInt(config.get('REDIS_PORT') || '6379', 10),
          password: config.get('REDIS_PASSWORD') || undefined,
        },
        // prefix giúp phân tách queue nếu nhiều môi trường
        prefix: config.get('BULL_PREFIX') || 'queues',
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: 'mail' }),
    MailModule,
  ],
})
export class AppModule {}
