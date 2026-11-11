import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../auth/interfaces/user.interface';
import { EquipamentoService } from '../service/equipamento.service';

@Controller('equipamentos')
@ApiTags('equipamentos')
@UseGuards(AuthGuard, RolesGuard)
export class EquipamentoController {
  constructor(private readonly equipamentoService: EquipamentoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar equipamentos do tenant autenticado' })
  list(
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.equipamentoService.findAllByTenant(user.tenantId, status, cursor);
  }

  @Get('imagens/busca')
  @ApiOperation({ summary: 'Buscar imagens no Pixabay' })
  searchImages(@GetUser() user: User, @Query('q') query = '') {
    this.requireOperator(user);
    return this.equipamentoService.searchImages(query);
  }

  @Patch(':equipmentId/imagem')
  @ApiOperation({ summary: 'Associar imagem do Pixabay a um equipamento' })
  async setImage(
    @Param('equipmentId') equipmentId: string,
    @Body() image: unknown,
    @GetUser() user: User,
  ): Promise<{ success: true }> {
    this.requireOperator(user);
    await this.equipamentoService.setImage(equipmentId, user.tenantId, image);
    return { success: true };
  }

  private requireOperator(user: User): void {
    if (user.role !== 'operacao' && user.role !== 'admin') {
      throw new ForbiddenException('Somente a equipe de operação pode gerenciar imagens.');
    }
  }
}
