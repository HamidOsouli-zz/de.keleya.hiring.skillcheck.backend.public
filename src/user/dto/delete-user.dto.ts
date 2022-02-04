import { IsNumber } from 'class-validator';

export class DeleteUserDto {
  @IsNumber()
  id: number;
}
