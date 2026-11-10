export interface User {
  sub: string;
  email: string;
  role: 'colaborador' | 'operacao' | 'admin';
  tenantId: string;
  iat: number;
  exp: number;
}