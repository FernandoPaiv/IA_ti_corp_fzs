import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { DemoModule } from './modules/demo/demo.module';
import { RootModule } from './modules/root/root.module';
import { EmprestimoModule } from './modules/emprestimo/emprestimo.module';
import { EquipamentoModule } from './modules/equipamento/equipamento.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    DemoModule,
    RootModule,
    EmprestimoModule,
    EquipamentoModule,
  ],
})
export class AppModule {}