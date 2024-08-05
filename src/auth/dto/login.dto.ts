import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { lowerCaseTransformer } from 'src/utils/lower-case.transformer';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(lowerCaseTransformer)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;
}
