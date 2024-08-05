import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.FileCreateInput) {
    const file = await this.prisma.file.create({ data: data });

    return file;
  }

  async findUnique(where: Prisma.FileWhereUniqueInput) {
    const file = await this.prisma.file.findUnique({ where: where });

    return file;
  }
}
