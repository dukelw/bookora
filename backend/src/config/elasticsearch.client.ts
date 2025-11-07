import { Client } from '@elastic/elasticsearch';

const node = process.env.ELASTIC_NODE || 'http://localhost:9200';
const authUser = process.env.ELASTIC_USERNAME;
const authPass = process.env.ELASTIC_PASSWORD;

export const ES_INDEX = process.env.ELASTIC_INDEX || 'books';

export const esClient = new Client(
  authUser && authPass
    ? { node, auth: { username: authUser, password: authPass } }
    : { node },
);
