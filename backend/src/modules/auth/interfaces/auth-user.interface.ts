import { UserRole } from '../../../generated/prisma/index.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access' | 'reset-password';
  iat?: number;
  exp?: number;
  passwordHash?: string;
}
