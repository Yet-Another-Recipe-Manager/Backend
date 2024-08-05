import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileResponseDto } from './dto/file-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<FileResponseDto> {
    return this.filesService.create(file);
  }
}
