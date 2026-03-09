import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync } from 'fs';
import { join } from 'path';
import { Movie, Producer, MovieProducer } from '../entities';
import { parseMovieListCsv } from './parse-csv';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
    @InjectRepository(MovieProducer)
    private readonly movieProducerRepo: Repository<MovieProducer>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    const csvPath = this.resolveCsvPath();
    const rows = parseMovieListCsv(csvPath);
    const nameToProducer = new Map<string, Producer>();

    for (const row of rows) {
      const movie = this.movieRepo.create({
        year: row.year,
        title: row.title,
        studios: row.studios,
        winner: row.winner,
      });
      const savedMovie = await this.movieRepo.save(movie);

      for (const name of row.producers) {
        let producer = nameToProducer.get(name);
        if (!producer) {
          producer = await this.producerRepo.save(
            this.producerRepo.create({ name })
          );
          nameToProducer.set(name, producer);
        }
        await this.movieProducerRepo.save(
          this.movieProducerRepo.create({
            movieId: savedMovie.id,
            producerId: producer.id,
          })
        );
      }
    }
  }

  private resolveCsvPath(): string {
    if (process.env['MOVIE_LIST_CSV']) {
      return process.env['MOVIE_LIST_CSV'];
    }

    const fromCwd = join(process.cwd(), 'data', 'Movielist.csv');
    if (existsSync(fromCwd)) {
      return fromCwd;
    }

    const fromDist = join(__dirname, '..', '..', '..', 'data', 'Movielist.csv');
    if (existsSync(fromDist)) {
      return fromDist;
    }
    
    return fromCwd;
  }
}
