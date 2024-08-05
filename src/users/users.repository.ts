import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prisma.user.create({ data: data });

    return user;
  }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: where,
      include: {
        picture: true,
      },
    });

    return user;
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    const user = await this.prisma.user.update({ where, data });

    return user;
  }
}
