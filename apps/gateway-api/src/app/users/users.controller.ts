import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserPermissions } from '@prisma/client';
import { UserSessionDto } from 'api/domain/dto/user-session.dto';
import { UserDto } from 'api/domain/dto/user.dto';
import { UsersDto } from 'api/domain/dto/users.dto';
import { ErrorMessage } from 'api/enums/error-message.enum';
import { CurrentUser } from 'libs/security/decorators/current-user.decorator';
import { RequirePermissions } from 'libs/security/decorators/require-permissions.decorator';
import { JwtPermissionsGuard } from 'libs/security/guards/jwt-permissions.guard';
import { GetAllUserBookingsQueryDto } from './domain/get-all-user-bookings.dto';
import { GetUsersQueryDto } from './domain/get-users-query.dto';
import { UpdateUserForm } from './domain/update-user.form';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UsersDto,
  })
  @Get()
  @RequirePermissions(UserPermissions.GetAllUsers)
  @UseGuards(JwtPermissionsGuard)
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    const usersWithCount = await this.usersService.findAllUsers(query);
    return UsersDto.fromResponse(usersWithCount);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user bookings' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UserDto,
  })
  @Get('me/bookings')
  @RequirePermissions(UserPermissions.GetAllUserBookings)
  @UseGuards(JwtPermissionsGuard)
  async getAllUserBookings(
    @CurrentUser() user: UserSessionDto,
    @Query() query: GetAllUserBookingsQueryDto,
  ) {
    const userEntity = await this.usersService.findUserById(user);
    if (!userEntity) {
      throw new InternalServerErrorException(ErrorMessage.RecordNotExists);
    }

    const userBookingsWithCount = await this.usersService.findAllUserBookings(
      user,
      query,
    );

    return UserDto.fromEntity(userEntity, userBookingsWithCount);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get me' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UserDto,
  })
  @Get('me')
  @RequirePermissions(UserPermissions.GetUser)
  @UseGuards(JwtPermissionsGuard)
  async getUser(@CurrentUser() user: UserSessionDto) {
    const userEntity = await this.usersService.findUserById(user);
    if (!userEntity) {
      throw new InternalServerErrorException(ErrorMessage.RecordNotExists);
    }

    return UserDto.fromEntity(userEntity);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ type: UpdateUserForm })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UserDto,
  })
  @Put(':userId')
  @RequirePermissions(UserPermissions.UpdateUser)
  @UseGuards(JwtPermissionsGuard)
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() form: UpdateUserForm,
  ) {
    const user = { id: userId };
    const userEntity = await this.usersService.findUserById(user);
    if (!userEntity) {
      throw new InternalServerErrorException(ErrorMessage.RecordNotExists);
    }

    const updatedUserEntity = await this.usersService.updateUser(user, form);
    if (!updatedUserEntity) {
      throw new InternalServerErrorException(ErrorMessage.RecordUpdationFailed);
    }

    return UserDto.fromEntity(updatedUserEntity);
  }
}
