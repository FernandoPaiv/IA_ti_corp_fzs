import { Module } from '@nestjs/common';
import { EmprestimoController } from './controller/emprestimo.controller';
import { EmprestimoService } from './service/emprestimo.service';
import { EmprestimoRepository } from './repository/emprestimo.repository';
import { EquipamentoService } from '../equipamento/service/equipamento.service';
import { EquipamentoRepository } from '../equipamento/repository/equipamento.repository';
import { CASLAbilityFactory } from '../auth/casl-ability.factory';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EmprestimoController],
  providers: [EmprestimoService, EmprestimoRepository, EquipamentoService, EquipamentoRepository, CASLAbilityFactory],
  exports: [EmprestimoService],
})
export class EmprestimoModule {}