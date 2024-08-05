import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role,
      status: createUserDto.status,
    });
    return new UserEntity(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  async findByID(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ id: id });

    if (!user) throw new NotFoundException(`No user with id (${id}) present!`);

    return new UserEntity(user);
  }

  async findByMail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ email: email });

    if (!user)
      throw new NotFoundException(`No user with id (${email}) present!`);

    return new UserEntity(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.update({ id: id }, updateUserDto);
    return new UserEntity(user);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
