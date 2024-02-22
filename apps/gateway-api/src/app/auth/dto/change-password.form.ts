import { ApiProperty } from '@nestjs/swagger';
import { RemoveExtraSpaces } from 'api/decorators/remove-extra-spaces.decorator';
import { IsNotEmpty, IsString, validate } from 'class-validator';

export class ChangePasswordForm {
  @ApiProperty({ description: 'old password' })
  @IsNotEmpty()
  @IsString()
  @RemoveExtraSpaces()
  public oldPassword: string;

  @ApiProperty({ description: 'new password' })
  @IsNotEmpty()
  @IsString()
  @RemoveExtraSpaces()
  public newPassword: string;

  @ApiProperty({ description: 'confirm new password' })
  @IsNotEmpty()
  @IsString()
  @RemoveExtraSpaces()
  public confirmNewPassword: string;

  static from(form?: ChangePasswordForm) {
    const it = new ChangePasswordForm();
    it.oldPassword = form.oldPassword;
    it.newPassword = form.newPassword;
    return it;
  }

  static async validate(form: ChangePasswordForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
