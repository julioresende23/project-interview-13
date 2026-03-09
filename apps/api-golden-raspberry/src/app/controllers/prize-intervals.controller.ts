import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrizeIntervalDto } from '@api/domain';
import { PrizeIntervalService } from '@api/domain/lib/golden-raspberry/services/prize-interval.service';

@ApiTags('prize-intervals')
@Controller('prize-intervals')
export class PrizeIntervalsController {
  constructor(private readonly prizeIntervalService: PrizeIntervalService) {}

  @Get()
  @ApiOperation({
    summary: 'Get prize intervals',
    description:
      'Producers with smallest and largest interval between two consecutive wins.',
  })
  @ApiResponse({ status: 200, description: 'Prize interval data.', type: PrizeIntervalDto })
  async getPrizeIntervals(): Promise<PrizeIntervalDto> {
    return this.prizeIntervalService.getPrizeIntervals();
  }
}
