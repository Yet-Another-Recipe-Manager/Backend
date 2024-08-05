import { ApiResponseProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiResponseProperty()
  accessToken: string;

  @ApiResponseProperty()
  refreshToken: string;

  @ApiResponseProperty()
  tokenExpires: number;
}
