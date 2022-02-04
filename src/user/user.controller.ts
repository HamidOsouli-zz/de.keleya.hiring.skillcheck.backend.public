import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  HttpCode,
  UseGuards,
  NotImplementedException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Admin } from 'src/common/decorators/isAdmin.decorator';
import { EndpointIsPublic } from 'src/common/decorators/publicEndpoint.decorator';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Headers } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Admin()
  @Get()
  async find(@Query() findUserDto: FindUserDto, @Req() req: Request) {
    this.usersService.find(findUserDto);
  }

  @Admin()
  @Get(':id')
  async findUnique(@Param('id', ParseIntPipe) id, @Req() req: Request) {
    throw new NotImplementedException();
  }

  @Admin()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    this.usersService.create(createUserDto);
  }
  @Admin()
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    throw new NotImplementedException();
  }
  @Admin()
  @Delete()
  async delete(@Body() deleteUserDto: DeleteUserDto, @Req() req: Request) {
    return this.usersService.delete(deleteUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @EndpointIsPublic()
  @Post('validate')
  async userValidateToken(@Req() req: Request) {
    return this.usersService.validateToken(req.headers.authorization.split(' ')[1]);
  }

  @HttpCode(HttpStatus.OK)
  @EndpointIsPublic()
  @Post('authenticate')
  async userAuthenticate(@Body() authenticateUserDto: AuthenticateUserDto) {
    const isAuthenticated = await this.usersService.authenticate(authenticateUserDto);
    // since authenticate() must return true or false, and endpoint test requires credentials to be passed
    return {
      credentials: isAuthenticated,
    };
  }

  @HttpCode(HttpStatus.OK)
  @EndpointIsPublic()
  @Post('token')
  async userGetToken(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.usersService.authenticateAndGetJwtToken(authenticateUserDto);
  }
}
