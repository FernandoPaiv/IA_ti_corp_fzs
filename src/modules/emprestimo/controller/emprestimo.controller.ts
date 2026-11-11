import {
  Controller,
  Post,
  Param,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { EmprestimoService } from '../service/emprestimo.service';
import { EmprestimoRepository } from '../repository/emprestimo.repository';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../auth/interfaces/user.interface';

@Controller('emprestimos')
@ApiTags('emprestimos')
export class EmprestimoController {
  constructor(
    private readonly emprestimoService: EmprestimoService,
    private readonly emprestimoRepository: EmprestimoRepository,
  ) {}

  @Post('solicitar/:equipmentId')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Solicitar empréstimo de equipamento' })
  @ApiResponse({ status: 201, description: 'Empréstimo solicitado com sucesso' })
  @ApiResponse({ status: 400, description: 'Requisição inválida (regras de negócio)' })
  @ApiResponse({ status: 403, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Equipamento não encontrado' })
  async solicitarEmprestimo(
    @Param('equipmentId') equipmentId: string,
    @GetUser() user: User,
  ) {
    return this.emprestimoService.solicitarEmprestimo(
      user.sub,
      user.tenantId,
      equipmentId,
    );
  }

  @Post(':loanId/devolver')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Registrar devolução de empréstimo' })
  devolver(
    @Param('loanId') loanId: string,
    @GetUser() user: User,
  ) {
    return this.emprestimoService.devolverEmprestimo(user.sub, user.tenantId, loanId);
  }

  @Get('meus')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar meu histórico de empréstimos' })
  @ApiResponse({ status: 200, description: 'Lista de empréstimos do usuário' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Não autorizado a ver empréstimos deste tenant' })
  async meusEmprestimos(
    @GetUser() user: User,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.emprestimoService.findByUserAndTenant(
      user.sub,
      user.tenantId,
      cursor,
    );

    const { open: totalAbertos } = await this.emprestimoService.countByUserAndTenant(
      user.sub,
      user.tenantId,
    );

    return {
      ...result,
      totalAbertos,
    };
  }
}