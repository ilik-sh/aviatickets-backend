import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { SignOptions } from 'jsonwebtoken';

export interface SecurityConfig {
  accessTokenOptions: {
    secret: string;
    signOptions: SignOptions;
  };
  refreshTokenOptions: {
    secret: string;
    signOptions: SignOptions;
  };
  resetTokenOptions: {
    secret: string;
    signOptions: SignOptions;
  };
}

export default registerAs('security', () => {
  const envVarsSchema = Joi.object()
    .keys({
      ACCESS_TOKEN_SECRET: Joi.string().required(),
      RESET_TOKEN_SECRET: Joi.string().required(),
      REFRESH_TOKEN_SECRET: Joi.string().required(),
      ACCESS_TOKEN_LIFETIME: Joi.string().default('1d').required(),
      RESET_TOKEN_LIFETIME: Joi.string().default('5m').required(),
      REFRESH_TOKEN_LIFETIME: Joi.string().default('30d').required(),
    })
    .unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    accessTokenOptions: {
      secret: envVars.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: envVars.ACCESS_TOKEN_LIFETIME,
      },
    },
    refreshTokenOptions: {
      secret: envVars.REFRESH_TOKEN_SECRET,
      signOptions: {
        expiresIn: envVars.REFRESH_TOKEN_LIFETIME,
      },
    },
    resetTokenOptions: {
      secret: envVars.RESET_TOKEN_SECRET,
      signOptions: {
        expiresIn: envVars.RESET_TOKEN_LIFETIME,
      },
    },
  } as SecurityConfig;
});
