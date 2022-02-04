import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
export class FindUserDto {
  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsNumber()
  offset: number;

  @IsOptional()
  @IsNumber() // since it is timestamp
  updatedSince: number;

  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  credentials = 'false';

  @IsOptional()
  @IsString()
  email: string;
}
