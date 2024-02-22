import { IsString, Length } from 'class-validator';
import { RemoveExtraSpaces } from 'api/decorators/remove-extra-spaces.decorator';
import { ApiProperty } from '@nestjs/swagger';

enum FirstName {
  MinLength = 2,
  MaxLength = 50,
}

enum LastName {
  MinLength = 2,
  MaxLength = 50,
}

export class UpdateUserForm {
  @ApiProperty({ description: 'user first name' })
  @Length(FirstName.MinLength, FirstName.MaxLength)
  @IsString()
  @RemoveExtraSpaces()
  firstName: string;

  @ApiProperty({ description: 'user last name' })
  @Length(LastName.MinLength, LastName.MaxLength)
  @IsString()
  @RemoveExtraSpaces()
  lastName: string;
}
