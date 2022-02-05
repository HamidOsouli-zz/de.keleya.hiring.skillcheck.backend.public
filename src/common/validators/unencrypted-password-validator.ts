import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { STRONG_PASSWORD_PATTERN } from '../utils/constants';

export type UnencryptedPassword = string;

@ValidatorConstraint({ name: 'unencryptedPasswordValidator', async: true })
@Injectable()
export class UnencryptedPasswordValidator implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(val: UnencryptedPassword, args: ValidationArguments) {
    if (!val) return false;
    return this.isValidPassword(val);
  }

  isValidPassword(passwordToValidate: string): boolean {
    if (!passwordToValidate) return false;
    if (passwordToValidate.length < 6) return false;
    return STRONG_PASSWORD_PATTERN.test(passwordToValidate);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return `Password is not complex enough`;
  }
}

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPasswordStrong',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UnencryptedPasswordValidator,
    });
  };
}
