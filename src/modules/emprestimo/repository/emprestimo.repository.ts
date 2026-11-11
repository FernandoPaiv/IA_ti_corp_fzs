import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

export interface Emprestimo {
  id: string;
  tenantId: string;
  equipmentId: string;
  userId: string;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
  createdBy: string | null;
}

export interface EmprestimoComEquipamento {
  id: string;
  tenantId: string;
  equipmentId: string;
  userId: string;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
  equipmentName: string;
  equipmentPatrimony: string | null;
  equipmentCategory: string | null;
  equipmentStatus: string;
}

export interface EmprestimosPorUsuario {
  emprestimos: EmprestimoComEquipamento[];
  total: number;
  open: number;
}

@Injectable()
export class EmprestimoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndTenant(
    userId: string,
    tenantId: string,
    cursor?: string,
  ): Promise<{ emprestimos: EmprestimoComEquipamento[]; hasMore: boolean; nextCursor: string | null }> {
    const where = {
      tenantId,
      userId,
    };

    if (cursor) {
      const cursorExists = await this.prisma.loan.findFirst({
        where: { ...where, id: cursor },
        select: { id: true },
      });
      if (!cursorExists) {
        return { emprestimos: [], hasMore: false, nextCursor: null };
      }
    }

    const records = await this.prisma.loan.findMany({
      where,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            patrimony: true,
            category: true,
            status: true,
          },
        },
      },
      orderBy: [{ borrowedAt: 'desc' }, { id: 'desc' }],
      take: 21,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
    });

    const hasMore = records.length > 20;
    const page = records.slice(0, 20);
    return {
      emprestimos: page.map((loan) => ({
        id: loan.id,
        tenantId: loan.tenantId,
        equipmentId: loan.equipmentId,
        userId: loan.userId,
        borrowedAt: loan.borrowedAt,
        dueAt: loan.dueAt,
        returnedAt: loan.returnedAt,
        equipmentName: loan.equipment.name,
        equipmentPatrimony: loan.equipment.patrimony,
        equipmentCategory: loan.equipment.category,
        equipmentStatus: loan.equipment.status,
      })),
      hasMore,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  }

  async countByUserAndTenant(userId: string, tenantId: string): Promise<{ total: number; open: number }> {
    const [total, open] = await Promise.all([
      this.prisma.loan.count({ where: { tenantId, userId } }),
      this.prisma.loan.count({ where: { tenantId, userId, returnedAt: null } }),
    ]);

    return { total, open };
  }

  async findOpenByEquipmentId(equipmentId: string, tenantId: string): Promise<Emprestimo | null> {
    return this.prisma.loan.findFirst({
      where: {
        equipmentId,
        tenantId,
        returnedAt: null,
      },
    });
  }

  async create(data: {
    tenantId: string;
    equipmentId: string;
    userId: string;
    dueAt: Date;
  }): Promise<Emprestimo> {
    const emprestimo = await this.prisma.loan.create({
      data: {
        tenantId: data.tenantId,
        equipmentId: data.equipmentId,
        userId: data.userId,
        borrowedAt: new Date(),
        dueAt: data.dueAt,
        returnedAt: null,
        createdBy: data.userId,
      },
    });

    return {
      id: emprestimo.id,
      tenantId: emprestimo.tenantId,
      equipmentId: emprestimo.equipmentId,
      userId: emprestimo.userId,
      borrowedAt: emprestimo.borrowedAt,
      dueAt: emprestimo.dueAt,
      returnedAt: emprestimo.returnedAt,
      createdBy: emprestimo.createdBy,
    };
  }

  async updateReturnedAt(loanId: string, returnedAt: Date): Promise<Emprestimo> {
    const emprestimo = await this.prisma.loan.update({
      where: { id: loanId },
      data: { returnedAt },
    });

    return {
      id: emprestimo.id,
      tenantId: emprestimo.tenantId,
      equipmentId: emprestimo.equipmentId,
      userId: emprestimo.userId,
      borrowedAt: emprestimo.borrowedAt,
      dueAt: emprestimo.dueAt,
      returnedAt: emprestimo.returnedAt,
      createdBy: emprestimo.createdBy,
    };
  }
}