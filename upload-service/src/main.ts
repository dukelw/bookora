import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import chalk from 'chalk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:4000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const enableSwagger = process.env.ENABLE_SWAGGER !== 'false';
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Upload Service API')
      .setDescription('Các endpoint upload và quản lý media.')
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(chalk.bold.yellow(`Service running on http://localhost:${port}`));
  if (enableSwagger) {
    console.log(
      chalk.bold.green(
        `Swagger available at http://localhost:${port}/api/docs`,
      ),
    );
  }
}

bootstrap();
