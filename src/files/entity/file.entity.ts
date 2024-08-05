import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';
import fileConfig from '../config/file.config';
import { FileConfig } from '../config/file-config.type';

export class FileEntity {
  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @Allow()
  id: string;

  @ApiResponseProperty({
    type: String,
    example: 'https://example.com/path/to/file.jpg',
  })
  @Transform((value) => {
    return `${(fileConfig() as FileConfig).publicS3Host}/${(fileConfig() as FileConfig).defaultS3Bucket}/${value.value}`;
  })
  path: string;
}
