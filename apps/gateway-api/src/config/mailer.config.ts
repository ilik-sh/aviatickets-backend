import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface MailerConfig {
  port: number;
  service: string;
  email: string;
  password: string;
}

export default registerAs('mailer', () => {
  const envVarsSchema = Joi.object()
    .keys({
      MAILER_EMAIL: Joi.string().required(),
      MAILER_PASSWORD: Joi.string().required(),
      MAILER_PORT: Joi.number().default(587).required(),
      MAILER_SERVICE: Joi.string().required(),
    })
    .unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    port: envVars.MAILER_PORT,
    service: envVars.MAILER_SERVICE,
    email: envVars.MAILER_EMAIL,
    password: envVars.MAILER_PASSWORD,
  };
});
