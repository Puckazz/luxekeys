import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { AUTH_ROLE_COOKIE_KEY } from '@/lib/auth-constants';
import { canAccessAdminPanel, type UserRole, USER_ROLES } from '@/lib/rbac';

const parseRoleFromCookie = (
  value: string | undefined
): UserRole | undefined => {
  if (!value) {
    return undefined;
  }

  return USER_ROLES.includes(value as UserRole)
    ? (value as UserRole)
    : undefined;
};

export function middleware(request: NextRequest) {
  const role = parseRoleFromCookie(
    request.cookies.get(AUTH_ROLE_COOKIE_KEY)?.value
  );

  if (!canAccessAdminPanel(role)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
