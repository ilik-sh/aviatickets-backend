import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('app', () => {
  const envVarsSchema = Joi.object()
    .keys({
      PORT: Joi.number().default(3001).required(),
    })
    .unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    port: envVars.PORT,
  };
});
