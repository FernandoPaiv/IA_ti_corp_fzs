import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface DemoStats {
  tenants: { total: number; items: Array<{ slug: string; name: string }> };
  equipments: { total: number };
  loans: { total: number; open: number };
}

/**
 * Camada de acesso a dados da tela de demonstracao. Isola o Prisma do service.
 * Somente leitura — pensada para "mostrar que o banco responde".
 */
@Injectable()
export class DemoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<DemoStats> {
    const [tenantTotal, tenants, equipmentTotal, loanTotal, loanOpen] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.findMany({ select: { slug: true, name: true }, orderBy: { name: 'asc' } }),
      this.prisma.equipment.count(),
      this.prisma.loan.count(),
      this.prisma.loan.count({ where: { returnedAt: null } }),
    ]);

    return {
      tenants: { total: tenantTotal, items: tenants },
      equipments: { total: equipmentTotal },
      loans: { total: loanTotal, open: loanOpen },
    };
  }
}
