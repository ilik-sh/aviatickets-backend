import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { RemoveExtraSpaces } from 'api/decorators/remove-extra-spaces.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInForm {
  @ApiProperty({ description: 'email' })
  @IsEmail()
  @IsString()
  @RemoveExtraSpaces()
  email: string;

  @ApiProperty({ description: 'password' })
  @IsString()
  @RemoveExtraSpaces()
  password: string;

  @ApiProperty({ description: 'device id' })
  @IsString()
  @IsNotEmpty()
  @RemoveExtraSpaces()
  deviceId: string;
}
