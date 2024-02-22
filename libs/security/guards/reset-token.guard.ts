import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyName } from '../constants/security.constants';

@Injectable()
export class ResetTokenGuard extends AuthGuard(
  StrategyName.ResetTokenStrategy,
) {}
