/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

enum PageSize {
  Min = 1,
  Max = 100,
  Default = 20,
}

enum PageNumber {
  Min = 1,
  Default = 1,
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'page size' })
  @Max(PageSize.Max)
  @Min(PageSize.Min)
  @Type(() => Number)
  @IsNumber()
  pageSize: number = PageSize.Default;

  @ApiPropertyOptional({ description: 'page number' })
  @Min(PageNumber.Min)
  @Type(() => Number)
  @IsNumber()
  pageNumber: number = PageNumber.Default;
}
