import { AuthConfig } from 'src/auth/config/auth-config.type';
import { AppConfig } from './app-config.type';
import { MailConfig } from 'src/mail/config/mail-config.type';
import { FileConfig } from 'src/files/config/file-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  mail: MailConfig;
  file: FileConfig;
};
