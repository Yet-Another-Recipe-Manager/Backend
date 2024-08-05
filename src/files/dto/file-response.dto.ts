import { ApiResponseProperty } from '@nestjs/swagger';
import { FileEntity } from '../entity/file.entity';

export class FileResponseDto {
  @ApiResponseProperty({
    type: () => FileEntity,
  })
  file: FileEntity;
}
