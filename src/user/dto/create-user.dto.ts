import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsPasswordStrong } from '../../common/validators/unencrypted-password-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsPasswordStrong({
    message:
      // eslint-disable-next-line max-len
      'Password must have at least one uppercase, one lowercase, one digit, and one special character and at least 8 characters',
  })
  password: string;
}
