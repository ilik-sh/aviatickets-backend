import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cities } from '@prisma/client';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  @ApiOperation({ summary: 'Get all cities' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: String,
    isArray: true,
  })
  @Get()
  async getAllCities() {
    return Object.values(Cities);
  }
}
