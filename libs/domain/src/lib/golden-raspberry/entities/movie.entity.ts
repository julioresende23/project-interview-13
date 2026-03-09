import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MovieProducer } from './movie-producer.entity';

@Entity('movie')
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('integer')
  year!: number;

  @Column()
  title!: string;

  @Column()
  studios!: string;

  @Column('boolean', { default: false })
  winner!: boolean;

  @OneToMany(() => MovieProducer, (mp) => mp.movie)
  movieProducers!: MovieProducer[];
}
