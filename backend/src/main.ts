import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as os from 'os';
import { esClient, ES_INDEX } from './config/elasticsearch.client';
import { BookService } from './modules/book/book.service';

dotenv.config();

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function waitForElasticsearch(retries = 30, interval = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await esClient.ping();
      console.log('✅ Elasticsearch is available');
      return;
    } catch (err) {
      console.log(`Waiting for Elasticsearch... (${i + 1}/${retries})`);
      await sleep(interval);
    }
  }
  throw new Error('Elasticsearch did not respond in time');
}

async function createIndexIfNotExists() {
  try {
    // cast response to any to support different client response shapes
    const existsResp: any = await esClient.indices.exists({
      index: ES_INDEX,
    } as any);
    const exists = existsResp && (existsResp.body ?? existsResp);
    if (exists) {
      console.log(`Index "${ES_INDEX}" already exists`);
      return;
    }

    console.log(`Creating index "${ES_INDEX}"...`);
    // cast params as any to satisfy TS signature differences across client versions
    await esClient.indices.create({
      index: ES_INDEX,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              autocomplete_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
            },
          },
        },
        mappings: {
          properties: {
            title: {
              type: 'text',
              analyzer: 'standard',
              fields: { keyword: { type: 'keyword' } },
            },
            author: { type: 'text', analyzer: 'standard' },
            description: { type: 'text', analyzer: 'standard' },
            category: {
              properties: {
                id: { type: 'keyword' },
                name: { type: 'text', analyzer: 'standard' },
              },
            },
            price: { type: 'double' },
            publishedAt: { type: 'date' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      },
    } as any);
    console.log(`Index "${ES_INDEX}" created`);
  } catch (err) {
    console.error('Failed to create index', err);
    throw err;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => {
    console.log('Request handled by: ', os.hostname());
    next();
  });

  console.log(process.env.CLIENT_URL);
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:4000', // Swagger UI
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests without origin (Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Bookstore API')
    .setDescription('REST API for book store/reader')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`✅ API: http://localhost:${port}`);
  console.log(`✅ Swagger: http://localhost:${port}/api/docs`);

  // --- Automatic Elasticsearch setup (controlled by env vars) ---
  if (process.env.ES_AUTO_SETUP === 'true') {
    try {
      await waitForElasticsearch();

      await createIndexIfNotExists();

      if (process.env.ES_REINDEX_ON_STARTUP === 'true') {
        const bookService = app.get<BookService>(BookService);

        if (process.env.ES_REINDEX_BACKGROUND === 'true') {
          bookService
            .reindexAll()
            .then(() => console.log('Reindex completed (background)'))
            .catch((err) => console.error('Reindex failed (background)', err));
        } else {
          console.log('Starting blocking reindex... this may take a while');
          await bookService.reindexAll();
          console.log('Reindex completed');
        }
      }
    } catch (err) {
      console.error(
        'Elasticsearch auto-setup failed (will continue without ES):',
        err,
      );
      // Do NOT crash the app. findAll has fallback to Mongo.
    }
  }
}
bootstrap().catch((err) => {
  console.error('Bootstrap error', err);
  process.exit(1);
});
