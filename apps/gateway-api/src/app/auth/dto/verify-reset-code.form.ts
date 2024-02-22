import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, validate } from 'class-validator';

export class VerifyResetCodeForm {
  @ApiProperty({ description: 'reset code' })
  @IsNumber()
  public code: number;

  static from(form?: VerifyResetCodeForm) {
    const it = new VerifyResetCodeForm();
    it.code = form?.code;
    return it;
  }

  static async validate(form: VerifyResetCodeForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
