import {
  HttpStatus,
  Module,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { S3Client } from '@aws-sdk/client-s3';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { AUTO_CONTENT_TYPE } from 'multer-s3';
import { FilesRepository } from './files.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import * as multerS3 from 'multer-s3';

@Module({
  providers: [FilesService, FilesRepository],
  controllers: [FilesController],
  imports: [
    PrismaModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const s3 = new S3Client({
          endpoint: configService.get('file.S3Host', { infer: true }),
          tls: false,
          forcePathStyle: true,
          region: configService.get('file.S3Region', { infer: true }),
          credentials: {
            accessKeyId: configService.getOrThrow('file.accessKeyId', {
              infer: true,
            }),
            secretAccessKey: configService.getOrThrow('file.secretAccessKey', {
              infer: true,
            }),
          },
        });

        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return callback(
                new UnprocessableEntityException({
                  status: HttpStatus.UNPROCESSABLE_ENTITY,
                  errors: {
                    file: `cantUploadFileType`,
                  },
                }),
                false,
              );
            }

            callback(null, true);
          },
          storage: multerS3({
            s3: s3,
            bucket: configService.getOrThrow('file.defaultS3Bucket', {
              infer: true,
            }),
            contentType: AUTO_CONTENT_TYPE,
            key: (request, file, callback) => {
              callback(
                null,
                `${randomStringGenerator()}.${file.originalname
                  .split('.')
                  .pop()
                  ?.toLowerCase()}`,
              );
            },
          }),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
          },
        };
      },
    }),
  ],
})
export class FilesModule {}
