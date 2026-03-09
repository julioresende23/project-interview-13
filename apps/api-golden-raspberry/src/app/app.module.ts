import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DomainModule } from '@api/domain';
import { PrizeIntervalsController } from './controllers/prize-intervals.controller';
import { AppService } from './app.service';

@Module({
  imports: [DomainModule],
  controllers: [AppController, PrizeIntervalsController],
  providers: [AppService],
})
export class AppModule {}
