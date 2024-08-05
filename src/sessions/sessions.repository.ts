import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Session } from '@prisma/client';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    const session = await this.prisma.session.create({ data: data });

    return session;
  }

  async update(
    where: Prisma.SessionWhereUniqueInput,
    data: Prisma.SessionUpdateInput,
  ): Promise<Session> {
    const session = this.prisma.session.update({ where, data });

    return session;
  }

  async findOne(where: Prisma.SessionWhereUniqueInput): Promise<Session> {
    const session = await this.prisma.session.findUnique({ where: where });

    return session;
  }

  async find(where?: Prisma.SessionWhereInput): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({ where });

    return sessions;
  }

  async removeMany(
    where: Prisma.SessionWhereInput,
  ): Promise<Prisma.BatchPayload> {
    const count = await this.prisma.session.deleteMany({ where });

    return count;
  }

  async remove(where: Prisma.SessionWhereUniqueInput): Promise<Session> {
    const session = this.prisma.session.delete({ where });

    return session;
  }
}
