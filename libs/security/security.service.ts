import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Device, Role, User } from '@prisma/client';
import { SecurityConfig } from 'api/config/security.config';
import { UserResetTokenDto } from 'api/domain/dto/user-reset-token.dto';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { ErrorMessage } from 'api/enums/error-message.enum';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string) {
    const hash = crypto.createHash('MD5');
    return hash.update(password).digest('hex');
  }

  async comparePasswords(plainPassword: string, hashedPassword: string) {
    return (await this.hashPassword(plainPassword)) === hashedPassword;
  }

  generateTokens(
    model: User & { role: Role },
    device: Pick<Device, 'deviceId'>,
  ) {
    const payload = UserSessionDto.toPlainObject(model, device.deviceId);
    const securityConfig = this.config.get<SecurityConfig>('security');

    const { secret: atSecret, signOptions: atSignOptions } =
      securityConfig.accessTokenOptions;
    const { secret: rtSecret, signOptions: rtSignOptions } =
      securityConfig.refreshTokenOptions;

    const accessToken = this.jwtService.sign(payload, {
      secret: atSecret,
      ...atSignOptions,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: rtSecret,
      ...rtSignOptions,
    });

    return { accessToken, refreshToken };
  }

  generateResetToken(
    user: Pick<User, 'id'>,
    device: Pick<Device, 'deviceId'>,
    hashedResetCode: Pick<Device, 'hashedResetCode'>['hashedResetCode'] = null,
  ) {
    const securityConfig = this.config.get<SecurityConfig>('security');
    const { secret: resetSecret, signOptions: resetSignOptions } =
      securityConfig.resetTokenOptions;

    const payload: UserResetTokenDto = {
      deviceId: device.deviceId,
      id: user.id,
      hashedResetCode,
    };

    const resetToken = this.jwtService.sign(payload, {
      secret: resetSecret,
      ...resetSignOptions,
    });

    return resetToken;
  }

  decodeResetToken(token: string) {
    const securityConfig = this.config.get<SecurityConfig>('security');
    const { secret: resetSecret } = securityConfig.resetTokenOptions;

    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: resetSecret,
      });
      const isValid = true;

      return { decodedToken, isValid };
    } catch (error) {
      throw new UnauthorizedException(ErrorMessage.BadResetToken);
    }
  }

  generateResetCode(): number {
    const min = 100000;
    const max = 999999;
    const randomResetCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomResetCode;
  }

  hashResetCode(resetCode: number): string {
    const hash = crypto.createHash('sha256');
    hash.update(resetCode.toString());
    const hashedCode = hash.digest('hex');
    return hashedCode;
  }
}
