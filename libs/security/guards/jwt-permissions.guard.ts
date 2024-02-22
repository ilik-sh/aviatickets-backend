import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPermissions } from '@prisma/client';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { USER_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { includes, difference } from 'lodash';
import { AuthGuard } from '@nestjs/passport';
import { StrategyName } from '../constants/security.constants';

@Injectable()
export class JwtPermissionsGuard
  extends AuthGuard(StrategyName.AccessTokenStrategy)
  implements CanActivate
{
  protected readonly logger = new Logger('JwtPermissionsGuard');
  protected permissions: UserPermissions[];

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    this.permissions =
      this.reflector.get<UserPermissions[]>(
        USER_PERMISSIONS_KEY,
        context.getHandler(),
      ) || [];

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  handleRequest(err: Error, user: UserSessionDto): UserSessionDto {
    if (err || !user) {
      this.logger.error('User is not authorized to perform request!');
      throw new UnauthorizedException();
    }

    if (includes(user.permissions, UserPermissions.All)) {
      return user;
    }

    if (
      user.permissions.some((userPermission) =>
        this.permissions.includes(userPermission),
      )
    ) {
      return user;
    }

    if (difference(this.permissions, user.permissions).length) {
      this.logger.error(
        `User [${user.id}] is not authorized to perform request`,
      );
      throw new UnauthorizedException();
    }

    throw new UnauthorizedException();
  }
}
