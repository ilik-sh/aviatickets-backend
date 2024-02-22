import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { RemoveExtraSpaces } from 'api/decorators/remove-extra-spaces.decorator';
import { STRONG_PASSWORD_REG_EXP } from '../constants/auth.constants';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpForm {
  @ApiProperty({ description: 'email' })
  @IsEmail()
  @IsString()
  @RemoveExtraSpaces()
  email: string;

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

  @ApiProperty({ description: 'first name' })
  @IsString()
  @RemoveExtraSpaces()
  firstName: string;

  @ApiProperty({ description: 'last name' })
  @IsString()
  @RemoveExtraSpaces()
  lastName: string;

  @ApiProperty({ description: 'device id' })
  @IsString()
  @IsNotEmpty()
  @RemoveExtraSpaces()
  deviceId: string;
}
