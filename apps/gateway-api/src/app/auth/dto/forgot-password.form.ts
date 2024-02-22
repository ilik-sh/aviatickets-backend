import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsUUID, validate } from 'class-validator';

export class ForgotPasswordForm {
  @ApiProperty({ description: 'email' })
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID()
  public deviceId: string;

  static from(form?: ForgotPasswordForm) {
    const it = new ForgotPasswordForm();
    it.email = form.email;
    it.deviceId = form.deviceId;
    return it;
  }

  static async validate(form: ForgotPasswordForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
