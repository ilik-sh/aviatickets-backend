import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserResetTokenDto } from 'api/domain/dto/user-reset-token.dto';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { StrategyName } from '../constants/security.constants';

@Injectable()
export class ResetTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyName.ResetTokenStrategy,
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('security.resetTokenOptions.secret'),
    });
  }

  validate(payload: UserResetTokenDto): UserResetTokenDto {
    return payload;
  }
}
