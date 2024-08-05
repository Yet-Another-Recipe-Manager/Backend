import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-pssword.dto';
import { NullableType } from 'src/utils/nullable.type';
import { UserEntity } from 'src/users/entities/user.entity';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JWTPayload } from './decorator/jwt.decorator';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { JWTRefreshPayload } from './decorator/jwt-refresh.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    return this.authService.register(registerDto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.authService.confirmEmail(confirmEmailDto.hash);
  }

  @Post('confirm/new')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.authService.confirmNewEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOkResponse({
    type: UserEntity,
  })
  @HttpCode(HttpStatus.OK)
  public me(
    @JWTPayload() jwtPayload: JwtPayloadType,
  ): Promise<NullableType<UserEntity>> {
    return this.authService.me(jwtPayload);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  public refresh(
    @JWTRefreshPayload() jwtRefreshPayload: JwtRefreshPayloadType,
  ): Promise<RefreshResponseDto> {
    return this.authService.refreshToken({
      sessionID: jwtRefreshPayload.sessionID,
      hash: jwtRefreshPayload.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @JWTRefreshPayload() jwtRefreshPayload: JwtRefreshPayloadType,
  ): Promise<void> {
    await this.authService.logout({
      sessionID: jwtRefreshPayload.sessionID,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UserEntity,
  })
  public update(
    @JWTPayload() jwtPayload: JwtPayloadType,
    @Body() authUpdateDto: AuthUpdateDto,
  ): Promise<NullableType<UserEntity>> {
    return this.authService.update(jwtPayload, authUpdateDto);
  }
}
