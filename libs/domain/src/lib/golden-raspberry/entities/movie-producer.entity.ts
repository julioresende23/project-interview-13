import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { Producer } from './producer.entity';

@Entity('movie_producer')
export class MovieProducer {
  @PrimaryColumn()
  movieId!: number;

  @PrimaryColumn()
  producerId!: number;

  @ManyToOne(() => Movie, (m) => m.movieProducers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie!: Movie;

  @ManyToOne(() => Producer, (p) => p.movieProducers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producerId' })
  producer!: Producer;
}
