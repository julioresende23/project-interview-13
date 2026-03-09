import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { GoldenRaspberryDomainModule } from './golden-raspberry/domain.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
    GoldenRaspberryDomainModule,
  ],
  exports: [TypeOrmModule, GoldenRaspberryDomainModule],
})
export class DomainModule {}
