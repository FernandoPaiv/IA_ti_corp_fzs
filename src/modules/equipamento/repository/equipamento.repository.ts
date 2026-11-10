import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

export interface Equipamento {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  patrimony: string | null;
  status: string;
  notes: string | null;
  imageUrl: string | null;
  imageSourceId: string | null;
  imagePhotographer: string | null;
  imagePageUrl: string | null;
}

@Injectable()
export class EquipamentoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(equipmentId: string, tenantId: string): Promise<Equipamento | null> {
    return this.prisma.equipment.findFirst({
      where: { id: equipmentId, tenantId },
    });
  }

  async findAllByTenant(
    tenantId: string,
    status?: string,
    cursor?: string
  ): Promise<{ equipments: Equipamento[]; hasMore: boolean; nextCursor: string | null }> {
    const where: { tenantId: string; status?: string } = { tenantId };
    if (status) {
      where.status = status;
    }

    if (cursor) {
      const cursorExists = await this.prisma.equipment.findFirst({
        where: { ...where, id: cursor },
        select: { id: true },
      });
      if (!cursorExists) {
        return { equipments: [], hasMore: false, nextCursor: null };
      }
    }

    const equipments = await this.prisma.equipment.findMany({
      where,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 21,
    });

    const hasMore = equipments.length > 20;
    const items = equipments.slice(0, 20);
    return {
      equipments: items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }

  async setImage(
    equipmentId: string,
    tenantId: string,
    image: { imageUrl: string; sourceId: string; photographer: string; pageUrl: string },
  ) {
    const result = await this.prisma.equipment.updateMany({
      where: { id: equipmentId, tenantId },
      data: {
        imageUrl: image.imageUrl,
        imageSourceId: image.sourceId,
        imagePhotographer: image.photographer,
        imagePageUrl: image.pageUrl,
      },
    });
    return result.count;
  }

  async countByTenantAndStatus(tenantId: string, status: string): Promise<number> {
    return this.prisma.equipment.count({
      where: { tenantId, status },
    });
  }

  async findAvailableByTenant(tenantId: string): Promise<Equipamento[]> {
    return this.prisma.equipment.findMany({
      where: { tenantId, status: 'disponivel' },
    });
  }
}