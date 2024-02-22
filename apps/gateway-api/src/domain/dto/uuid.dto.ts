import { ApiProperty } from '@nestjs/swagger';

export class UUIDDto {
  @ApiProperty({ description: 'id' })
  id: string;

  @ApiProperty({ description: 'created at' })
  createdAt: number;

  @ApiProperty({ description: 'updated at' })
  updatedAt: number;
}
