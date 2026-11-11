import { Injectable } from '@nestjs/common';

type UserRole = 'colaborador' | 'operacao' | 'admin';

interface UserPermissions {
  role: UserRole;
  tenantId: string;
}

@Injectable()
export class CASLAbilityFactory {
  defineAbility(user: UserPermissions) {
    // Regras simplificadas - autorização real feita via Prisma RLS + guard
    // Esta factory está aqui para injeção de dependência e compatibilidade
    // As regras de negócio principais estão no service e no Prisma

    return {
      can: [],
      cannot: [],
      user,
    };
  }
}