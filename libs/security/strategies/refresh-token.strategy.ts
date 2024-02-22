import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { StrategyName } from '../constants/security.constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyName.RefreshTokenStrategy,
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('security.refreshTokenOptions.secret'),
    });
  }

  validate(payload: UserSessionDto): UserSessionDto {
    return payload;
  }
}
