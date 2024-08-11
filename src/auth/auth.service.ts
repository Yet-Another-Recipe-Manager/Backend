import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as ms from 'ms';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UsersService } from 'src/users/users.service';
import { compare, compareSync, hashSync } from 'bcrypt';
import { createHash } from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { SessionsService } from 'src/sessions/sessions.service';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { MailService } from 'src/mail/mail.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { NullableType } from 'src/utils/nullable.type';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByMail(loginDto.email);

    if (!user)
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
      });

    if (!user.password)
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'unprovidedPassword',
        },
      });

    const isValidPassword = compareSync(loginDto.password, user.password);

    if (!isValidPassword)
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        errors: {
          password: 'invalid',
        },
      });

    const hash = createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionsService.create({
      hash,
      userID: user.id,
    });

    const { accessToken, refreshToken, tokenExpires } =
      await this.getTokensData({
        id: user.id,
        role: user.role,
        sessionId: session.id,
        hash,
      });

    return {
      refreshToken,
      accessToken,
      tokenExpires,
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashSync(registerDto.password, 10),
      role: 'USER',
      status: 'INACTIVE',
    });

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );

    await this.mailService.userSignUp({
      to: registerDto.email,
      data: {
        hash,
      },
    });
  }

  async confirmEmail(hash: string): Promise<void> {
    let userID: UserEntity['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: UserEntity['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userID = jwtData.confirmEmailUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findByID(userID);

    if (!user || user?.status != 'INACTIVE') {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    user.status = 'ACTIVE';

    await this.usersService.update(user.id, user);
  }

  async confirmNewEmail(hash: string): Promise<void> {
    let userID: UserEntity['id'];
    let newEmail: UserEntity['email'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: UserEntity['id'];
        newEmail: UserEntity['email'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userID = jwtData.confirmEmailUserId;
      newEmail = jwtData.newEmail;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findByID(userID);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`,
      });
    }

    user.email = newEmail;
    user.status = 'ACTIVE';

    await this.usersService.update(user.id, user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByMail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists',
        },
      });
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userID: UserEntity['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: UserEntity['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });

      userID = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.usersService.findByID(userID);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`,
        },
      });
    }

    user.password = password;

    await this.sessionsService.deleteByUserID(user.id);

    await this.usersService.update(user.id, user);
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<UserEntity>> {
    const currentUser = await this.usersService.findByID(userJwtPayload.id);

    if (!currentUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'missingOldPassword',
          },
        });
      }

      if (!currentUser.password) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      }

      const isValidOldPassword = await compare(
        userDto.oldPassword,
        currentUser.password,
      );

      if (!isValidOldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      } else {
        await this.sessionsService.deleteByUserID(currentUser.id);
      }
    }

    if (userDto.email && userDto.email !== currentUser.email) {
      const userByEmail = await this.usersService.findByMail(userDto.email);

      if (userByEmail && userByEmail.id !== currentUser.id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailExists',
          },
        });
      }

      const hash = await this.jwtService.signAsync(
        {
          confirmEmailUserId: currentUser.id,
          newEmail: userDto.email,
        },
        {
          secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
            infer: true,
          }),
        },
      );

      await this.mailService.confirmNewEmail({
        to: userDto.email,
        data: {
          hash,
        },
      });
    }

    delete userDto.email;
    delete userDto.oldPassword;

    await this.usersService.update(userJwtPayload.id, userDto);

    return this.usersService.findByID(userJwtPayload.id);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<UserEntity>> {
    return this.usersService.findByID(userJwtPayload.id);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionID' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionsService.findByID(data.sessionID);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    const hash = createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.usersService.findByID(session.userId);

    if (!user?.role) {
      throw new UnauthorizedException();
    }

    await this.sessionsService.update(session.id, {
      hash,
    });

    const { accessToken, refreshToken, tokenExpires } =
      await this.getTokensData({
        id: session.userId,
        role: user.role,
        sessionId: session.id,
        hash,
      });

    return {
      accessToken,
      refreshToken,
      tokenExpires,
    };
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionID'>) {
    return this.sessionsService.deleteByID(data.sessionID);
  }

  private async getTokensData(data: {
    id: string;
    role: $Enums.Role;
    sessionId: string;
    hash: string;
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenExpires,
    };
  }
}
