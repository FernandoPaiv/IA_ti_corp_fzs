import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DbService } from './db.service';

@Module({
  controllers: [HealthController],
  providers: [DbService],
})
export class HealthModule {}