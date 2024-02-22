import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SecurityService } from './security.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { ResetTokenStrategy } from './strategies/reset-token.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('security'),
    }),
  ],
  providers: [SecurityService, AccessTokenStrategy, RefreshTokenStrategy, ResetTokenStrategy],
  exports: [SecurityService],
})
export class SecurityModule {}
