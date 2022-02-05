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
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Admin } from '../common/decorators/isAdmin.decorator';
import { EndpointIsPublic } from '../common/decorators/publicEndpoint.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async find(@Query() findUserDto: FindUserDto, @Req() req: Request) {
    const { user } = req;
    return await this.usersService.find(findUserDto, user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findUnique(@Param('id', ParseIntPipe) id, @Req() req: Request) {
    const { user } = req;
    return await this.usersService.findUniqueByLoggedInUser({ id }, user);
  }

  @HttpCode(HttpStatus.OK)
  @Admin()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const { user } = req;
    return this.usersService.update(updateUserDto, user);
  }

  @Admin()
  @Delete()
  async delete(@Body() deleteUserDto: DeleteUserDto) {
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
