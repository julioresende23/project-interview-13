import { DataSource } from 'typeorm';
import { Movie, Producer, MovieProducer } from './golden-raspberry/entities';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [Movie, Producer, MovieProducer],
});
