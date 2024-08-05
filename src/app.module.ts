import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import appConfig from './config/app.config';
import authConfig from './auth/config/auth.config';
import mailConfig from './mail/config/mail.config';
import { AllConfigType } from './config/config.type';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { MailerModule } from './mailer/mailer.module';
import { FilesModule } from './files/files.module';
import fileConfig from './files/config/file.config';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mailConfig, fileConfig],
      envFilePath: ['.env'],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: join(__dirname, '..', '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    MailModule,
    MailerModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
