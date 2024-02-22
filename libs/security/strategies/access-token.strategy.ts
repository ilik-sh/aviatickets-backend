import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { StrategyName } from '../constants/security.constants';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyName.AccessTokenStrategy,
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('security.accessTokenOptions.secret'),
    });
  }

  validate(payload: UserSessionDto): UserSessionDto {
    return payload;
  }
}
