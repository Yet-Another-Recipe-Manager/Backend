import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { lowerCaseTransformer } from 'src/utils/lower-case.transformer';

export class AuthUpdateDto {
  @ApiPropertyOptional({ example: 'new.email@example.com' })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @Transform(lowerCaseTransformer)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  oldPassword?: string;
}
