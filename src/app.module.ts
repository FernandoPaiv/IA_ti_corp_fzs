import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { DemoModule } from './modules/demo/demo.module';
import { RootModule } from './modules/root/root.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule, HealthModule, DemoModule, RootModule],
})
export class AppModule {}