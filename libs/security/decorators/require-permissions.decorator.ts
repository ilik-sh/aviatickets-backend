import { SetMetadata } from '@nestjs/common';
import { UserPermissions } from '@prisma/client';

export const USER_PERMISSIONS_KEY = 'user_permissions';

export const RequirePermissions = (...permissions: UserPermissions[]) =>
  SetMetadata(USER_PERMISSIONS_KEY, permissions);
