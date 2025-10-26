import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Worker vẫn có thể listen để health-check
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(`Mail service worker running on port ${port}`);
}
bootstrap();
