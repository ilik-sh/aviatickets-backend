import { IsString, Matches, validate } from 'class-validator';
import { RemoveExtraSpaces } from 'api/decorators/remove-extra-spaces.decorator';
import { STRONG_PASSWORD_REG_EXP } from 'apps/gateway-api/src/app/auth/constants/auth.constants';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordForm {
  @ApiProperty({ description: 'password' })
  @Matches(STRONG_PASSWORD_REG_EXP)
  @IsString()
  @RemoveExtraSpaces()
  password: string;

  @ApiProperty({ description: 'confirm password' })
  @Matches(STRONG_PASSWORD_REG_EXP)
  @IsString()
  @RemoveExtraSpaces()
  confirmPassword: string;

  static from(form?: ResetPasswordForm) {
    const it = new ResetPasswordForm();
    it.password = form?.password;
    return it;
  }

  static async validate(form: ResetPasswordForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
