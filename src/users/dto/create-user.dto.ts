import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum($Enums.Role)
  role: $Enums.Role;

  @IsEnum($Enums.Status)
  status: $Enums.Status;
}
