import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    UsersModule,
    SessionsModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        secret: configService.getOrThrow('auth.secret', {
          infer: true,
        }),
        signOptions: {
          expiresIn: configService.getOrThrow('auth.expires', {
            infer: true,
          }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
