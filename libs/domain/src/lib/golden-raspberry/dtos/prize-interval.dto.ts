
export class PrizeIntervalEntryDto { 
  producer!: string;
  interval!: number;
  previousWin!: number;
  followingWin!: number;
}

export class PrizeIntervalDto { 
  min!: PrizeIntervalEntryDto[]; 
  max!: PrizeIntervalEntryDto[];
}
