import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MovieProducer } from './movie-producer.entity';

@Entity('producer')
export class Producer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => MovieProducer, (mp) => mp.producer)
  movieProducers!: MovieProducer[];
}
