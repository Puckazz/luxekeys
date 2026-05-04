import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../../modules/auth/interfaces/auth-user.interface';

type RequestWithUser = {
  user?: AuthUser;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
