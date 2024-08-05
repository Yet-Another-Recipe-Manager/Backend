import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { FileConfig } from './file-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  ACCESS_KEY_ID: string;

  @IsString()
  SECRET_ACCESS_KEY: string;

  @IsString()
  DEFAULT_S3_BUCKET: string;

  @IsString()
  S3_REGION: string;

  @IsString()
  S3_HOST: string;

  @IsString()
  PUBLIC_S3_HOST: string;
}

export default registerAs<FileConfig>('file', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    defaultS3Bucket: process.env.DEFAULT_S3_BUCKET,
    S3Region: process.env.S3_REGION,
    S3Host: process.env.S3_HOST,
    publicS3Host: process.env.PUBLIC_S3_HOST,
    maxFileSize: 5242880, // 5mb
  };
});
