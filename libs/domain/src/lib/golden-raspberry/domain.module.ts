import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Producer, MovieProducer } from './entities';
import { SeedService } from './services/seed.service';
import { PrizeIntervalService } from './services/prize-interval.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Producer, MovieProducer]),
  ],
  providers: [SeedService, PrizeIntervalService],
  exports: [TypeOrmModule, PrizeIntervalService],
})
export class GoldenRaspberryDomainModule {}
