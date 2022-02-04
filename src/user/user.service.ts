import { Injectable, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { JwtPayload } from 'src/common/types/jwtTokenUser';
import { hashPasswordSync, matchHashedPassword } from 'src/common/utils/password';
import { PrismaService } from '../prisma.services';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import createUserFilterSpecification from './filter/UserFilterSpecification';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Finds users with matching fields
   *
   * @param findUserDto
   * @returns User[]
   */
  async find(findUserDto: FindUserDto): Promise<User[]> {
    return this.prismaService.user.findMany({
      skip: findUserDto.offset || 0,
      take: findUserDto.limit || 15,
      include: {
        credentials: findUserDto.credentials,
      },
      where: createUserFilterSpecification(findUserDto),
    });
  }

  /**
   * Finds single User by id, name or email
   *
   * @param whereUnique
   * @returns User
   */
  async findUnique(whereUnique: Prisma.UserWhereUniqueInput, includeCredentials = false) {
    return null;
  }

  /**
   * Creates a new user with credentials
   *
   * @param createUserDto
   * @returns result of create
   */
  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    return this.prismaService.user.create({
      data: {
        name,
        email,
        credentials: {
          create: {
            hash: hashPasswordSync(password),
          },
        },
      },
    });
  }

  /**
   * Updates a user unless it does not exist or has been marked as deleted before
   *
   * @param updateUserDto
   * @returns result of update
   */
  async update(updateUserDto: UpdateUserDto) {
    throw new NotImplementedException();
  }

  /**
   * Deletes a user
   * Function does not actually remove the user from database but instead marks them as deleted by:
   * - removing the corresponding `credentials` row from your db
   * - changing the name to DELETED_USER_NAME constant (default: `(deleted)`)
   * - setting email to NULL
   *
   * @param deleteUserDto
   * @returns results of users and credentials table modification
   */
  async delete(deleteUserDto: DeleteUserDto) {
    throw new NotImplementedException();
  }

  /**
   * Authenticates a user and returns a JWT token
   *
   * @param authenticateUserDto email and password for authentication
   * @returns a JWT token
   */
  async authenticateAndGetJwtToken(authenticateUserDto: AuthenticateUserDto) {
    const { email, password } = authenticateUserDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
      include: {
        credentials: true,
      },
    });
    const passwordIsMatch = await matchHashedPassword(password, user.credentials.hash);
    if (user && passwordIsMatch) {
      const jwtPayload: JwtPayload = { id: user.id, username: user.email };
      const secret = this.configService.get<string>('JWT_SECRET');
      const jwtToken: string = await this.jwtService.signAsync(jwtPayload, { secret });
      return { token: jwtToken };
    } else {
      throw new UnauthorizedException('Check your credentials');
    }
  }

  /**
   * Authenticates a user
   *
   * @param authenticateUserDto email and password for authentication
   * @returns true or false
   */
  async authenticate(authenticateUserDto: AuthenticateUserDto) {
    const isAuthenticated = await this.authenticateAndGetJwtToken(authenticateUserDto);
    return !!isAuthenticated;
  }

  /**
   * Validates a JWT token
   *
   * @param token a JWT token
   * @returns the decoded token if valid
   */
  async validateToken(token: string) {
    return this.jwtService.decode(token);
  }
}
