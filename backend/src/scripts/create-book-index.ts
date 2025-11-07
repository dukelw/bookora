import { ES_INDEX, esClient } from 'src/config/elasticsearch.client';

async function createIndex() {
  // cast to any to avoid client type mismatches across ES client versions
  const existsResp: any = await esClient.indices.exists({ index: ES_INDEX });
  const exists = existsResp && (existsResp.body ?? existsResp); // handle different client shapes
  if (exists) {
    console.log(`Index ${ES_INDEX} already exists`);
    return;
  }

  // cast body as any to satisfy TypeScript for different client versions
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
    } as any,
  } as any);

  console.log(`Created index ${ES_INDEX}`);
}

createIndex()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
