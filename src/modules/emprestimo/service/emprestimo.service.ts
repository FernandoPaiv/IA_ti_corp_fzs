import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EmprestimoRepository } from '../repository/emprestimo.repository';
import { PrismaService } from '../../../prisma.service';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_OPEN_LOANS = 3;
const LOAN_PERIOD_DAYS = 14;

@Injectable()
export class EmprestimoService {
  constructor(
    private readonly emprestimoRepository: EmprestimoRepository,
    private readonly prisma: PrismaService,
  ) {}

  async solicitarEmprestimo(userId: string, tenantId: string, equipmentId: string) {
    this.validateUuid(userId, 'Usuário');
    this.validateUuid(tenantId, 'Tenant');
    this.validateUuid(equipmentId, 'Equipamento');

    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const lockKey = `${tenantId}:${userId}`;
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))::text AS lock`;

        const equipamento = await tx.equipment.findFirst({
          where: { id: equipmentId, tenantId },
          select: { id: true, status: true },
        });
        if (!equipamento) {
          throw new NotFoundException('Equipamento não encontrado neste tenant.');
        }

        const now = new Date();
        const overdueLoan = await tx.loan.findFirst({
          where: { tenantId, userId, returnedAt: null, dueAt: { lt: now } },
          select: { id: true },
        });
        if (overdueLoan) {
          throw new ConflictException(
            'O colaborador possui empréstimo atrasado. Regularize antes de solicitar novo empréstimo.',
          );
        }

        const openLoans = await tx.loan.count({ where: { tenantId, userId, returnedAt: null } });
        if (openLoans >= MAX_OPEN_LOANS) {
          throw new ConflictException('Limite máximo de 3 empréstimos em aberto atingido.');
        }
        if (equipamento.status !== 'disponivel') {
          throw new ConflictException(
            `Equipamento não está disponível para empréstimo. Status atual: ${equipamento.status}.`,
          );
        }

        const claimed = await tx.equipment.updateMany({
          where: { id: equipmentId, tenantId, status: 'disponivel' },
          data: { status: 'emprestado' },
        });
        if (claimed.count !== 1) {
          throw new ConflictException('Este equipamento já possui empréstimo em andamento.');
        }

        const dueAt = new Date(now.getTime() + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        const loan = await tx.loan.create({
          data: {
            tenantId,
            equipmentId,
            userId,
            createdBy: userId,
            borrowedAt: now,
            dueAt,
          },
        });
        await tx.auditLog.create({
          data: {
            tenantId,
            actorId: userId,
            action: 'loan.created',
            resource: 'loan',
            resourceId: loan.id,
          },
        });

        return { ...loan, message: 'Empréstimo solicitado com sucesso.' };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Este equipamento já possui empréstimo em andamento.');
      }
      throw error;
    }
  }

  async devolverEmprestimo(userId: string, tenantId: string, loanId: string) {
    this.validateUuid(userId, 'Usuário');
    this.validateUuid(tenantId, 'Tenant');
    this.validateUuid(loanId, 'Empréstimo');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const loan = await tx.loan.findFirst({
        where: { id: loanId, tenantId, userId, returnedAt: null },
        select: { id: true, equipmentId: true },
      });
      if (!loan) {
        throw new NotFoundException('Empréstimo em aberto não encontrado para este usuário.');
      }

      const returnedAt = new Date();
      const updated = await tx.loan.updateMany({
        where: { id: loan.id, tenantId, userId, returnedAt: null },
        data: { returnedAt },
      });
      if (updated.count !== 1) {
        throw new ConflictException('O empréstimo já foi devolvido.');
      }

      await tx.equipment.updateMany({
        where: { id: loan.equipmentId, tenantId, status: 'emprestado' },
        data: { status: 'disponivel' },
      });
      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          action: 'loan.returned',
          resource: 'loan',
          resourceId: loan.id,
        },
      });
      return { loanId: loan.id, returnedAt, message: 'Devolução registrada com sucesso.' };
    });
  }

  async findByUserAndTenant(userId: string, tenantId: string, cursor?: string) {
    this.validateUuid(userId, 'Usuário');
    this.validateUuid(tenantId, 'Tenant');
    if (cursor && !UUID_PATTERN.test(cursor)) {
      throw new BadRequestException('Cursor de empréstimo inválido.');
    }
    return this.emprestimoRepository.findByUserAndTenant(userId, tenantId, cursor);
  }

  async countByUserAndTenant(userId: string, tenantId: string) {
    this.validateUuid(userId, 'Usuário');
    this.validateUuid(tenantId, 'Tenant');
    return this.emprestimoRepository.countByUserAndTenant(userId, tenantId);
  }

  private validateUuid(value: string, label: string): void {
    if (!UUID_PATTERN.test(value)) {
      throw new BadRequestException(`${label} inválido.`);
    }
  }
}
