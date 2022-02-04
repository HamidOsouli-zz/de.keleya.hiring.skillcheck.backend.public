import { IsString } from 'class-validator';

export class AuthenticateUserDto {
  @IsString()
  email: string;
  @IsString()
  password: string;
}
