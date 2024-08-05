import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from 'src/mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [MailService],
  imports: [MailerModule, ConfigModule],
  exports: [MailService],
})
export class MailModule {}
