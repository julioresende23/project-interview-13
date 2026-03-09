import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities';
import {
  PrizeIntervalDto,
  PrizeIntervalEntryDto,
} from '../dtos/prize-interval.dto';

type ProducerIntervals = {
  name: string;
  intervals: { prev: number; next: number }[];
};

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
    const intervalsByProducer = this.computeConsecutiveIntervalsByProducer(producerWins);

    if (intervalsByProducer.length === 0) {
      return { min: [], max: [] };
    }

    const { minEntries, maxEntries } = this.collectMinAndMaxIntervalEntries(intervalsByProducer);
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

  private computeConsecutiveIntervalsByProducer(
    producerWins: Map<string, number[]>
  ): ProducerIntervals[] {
    const result: ProducerIntervals[] = [];
    for (const [name, years] of producerWins) {
      const sorted = [...new Set(years)].sort((a, b) => a - b);

      if (sorted.length < 2) continue;

      const intervals: { prev: number; next: number }[] = [];
      for (let i = 1; i < sorted.length; i++) {
        intervals.push({ prev: sorted[i - 1], next: sorted[i] });
      }
      result.push({ name, intervals });
    }
    return result;
  }

  private collectMinAndMaxIntervalEntries(
    intervalsByProducer: ProducerIntervals[]
  ): {
    minEntries: PrizeIntervalEntryDto[];
    maxEntries: PrizeIntervalEntryDto[];
  } {
    let minInterval = 9999;
    let maxInterval = -1;
    const minEntries: PrizeIntervalEntryDto[] = [];
    const maxEntries: PrizeIntervalEntryDto[] = [];

    for (const { name, intervals } of intervalsByProducer) {
      for (const { prev, next } of intervals) {
        const interval = next - prev;

        if (interval < minInterval) {
          minInterval = interval;
          minEntries.length = 0;
        }
        if (interval === minInterval) {
          minEntries.push({ producer: name, interval, previousWin: prev, followingWin: next });
        }

        if (interval > maxInterval) {
          maxInterval = interval;
          maxEntries.length = 0;
        }
        if (interval === maxInterval) {
          maxEntries.push({ producer: name, interval, previousWin: prev, followingWin: next });
        }
      }
    }

    return { minEntries, maxEntries };
  }

  private sortEntriesByProducerAndPreviousWin(entries: PrizeIntervalEntryDto[]): void {
    entries.sort(
      (a, b) => a.producer.localeCompare(b.producer) || a.previousWin - b.previousWin
    );
  }
}
