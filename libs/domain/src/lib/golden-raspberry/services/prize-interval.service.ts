import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities';
import {
  PrizeIntervalDto,
  PrizeIntervalEntryDto,
} from '../dtos/prize-interval.dto';

@Injectable()
export class PrizeIntervalService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>
  ) {}

  /** Retorna os produtores com menor e maior intervalo entre duas vitórias consecutivas. */
  async getPrizeIntervals(): Promise<PrizeIntervalDto> {
    const winners = await this.loadWinningMoviesWithProducers();
    const producerWins = this.groupWinYearsByProducer(winners);

    if (producerWins.size === 0) {
      return { min: [], max: [] };
    }

    const { minEntries, maxEntries } = this.findMinAndMaxIntervalEntriesFromProducerWins(producerWins);
    this.sortEntriesByProducerAndPreviousWin(minEntries);
    this.sortEntriesByProducerAndPreviousWin(maxEntries);

    return { min: minEntries, max: maxEntries };
  }

  private async loadWinningMoviesWithProducers(): Promise<Movie[]> {
    return this.movieRepo.find({
      where: { winner: true },
      relations: ['movieProducers', 'movieProducers.producer'],
      order: { year: 'ASC' },
    });
  }

  private groupWinYearsByProducer(winners: Movie[]): Map<string, number[]> {
    const producerWins = new Map<string, number[]>();
    for (const movie of winners) {
      const year = movie.year;
      for (const movieProducer of movie.movieProducers) {
        const name = movieProducer.producer.name;
        const years = producerWins.get(name) ?? [];
        years.push(year);
        producerWins.set(name, years);
      }
    }
    return producerWins;
  }

  private findMinAndMaxIntervalEntriesFromProducerWins(
    producerWins: Map<string, number[]>
  ): {
    minEntries: PrizeIntervalEntryDto[];
    maxEntries: PrizeIntervalEntryDto[];
  } {
    let minInterval = Infinity;
    let maxInterval = -Infinity;
    const minEntries: PrizeIntervalEntryDto[] = [];
    const maxEntries: PrizeIntervalEntryDto[] = [];

    for (const [name, years] of producerWins) {
      const sortedYears = [...new Set(years)].sort((a, b) => a - b);
      if (sortedYears.length < 2) continue;

      for (let i = 1; i < sortedYears.length; i++) {
        const prev = sortedYears[i - 1];
        const next = sortedYears[i];
        const interval = next - prev;

        if (interval < minInterval) {
          minInterval = interval;
          minEntries.length = 0;
        }
        if (interval === minInterval) {
          minEntries.push({
            producer: name,
            interval,
            previousWin: prev,
            followingWin: next,
          });
        }

        if (interval > maxInterval) {
          maxInterval = interval;
          maxEntries.length = 0;
        }
        if (interval === maxInterval) {
          maxEntries.push({
            producer: name,
            interval,
            previousWin: prev,
            followingWin: next,
          });
        }
      }
    }

    return { minEntries, maxEntries };
  }

  private sortEntriesByProducerAndPreviousWin(
    entries: PrizeIntervalEntryDto[]
  ): void {
    entries.sort(
      (a, b) => a.producer.localeCompare(b.producer) || a.previousWin - b.previousWin
    );
  }
}
