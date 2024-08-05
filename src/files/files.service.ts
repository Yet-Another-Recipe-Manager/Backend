import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileEntity } from './entity/file.entity';
import { FilesRepository } from './files.repository';
import { NullableType } from 'src/utils/nullable.type';

@Injectable()
export class FilesService {
  constructor(private readonly filesRepository: FilesRepository) {}

  async create(file: Express.MulterS3.File): Promise<{ file: FileEntity }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    return {
      file: await this.filesRepository.create({
        path: file.key,
      }),
    };
  }

  findById(id: FileEntity['id']): Promise<NullableType<FileEntity>> {
    return this.filesRepository.findUnique({ id: id });
  }
}
