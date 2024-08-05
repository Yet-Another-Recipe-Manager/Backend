import { ApiResponseProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/users/entities/user.entity';

export class LoginResponseDto {
  @ApiResponseProperty()
  accessToken: string;
  @ApiResponseProperty()
  refreshToken: string;
  @ApiResponseProperty()
  tokenExpires: number;
  @ApiResponseProperty()
  user: UserEntity;
}
