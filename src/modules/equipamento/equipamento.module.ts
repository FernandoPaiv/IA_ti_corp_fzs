import { Module } from '@nestjs/common';
import { EquipamentoService } from './service/equipamento.service';
import { EquipamentoRepository } from './repository/equipamento.repository';
import { CASLAbilityFactory } from '../auth/casl-ability.factory';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthModule } from '../auth/auth.module';
import { EquipamentoController } from './controller/equipamento.controller';

@Module({
  imports: [AuthModule],
  controllers: [EquipamentoController],
  providers: [EquipamentoService, EquipamentoRepository, CASLAbilityFactory],
  exports: [EquipamentoService],
})
export class EquipamentoModule {}