import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { FileEntity } from 'src/files/entity/file.entity';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    if (partial.picture) this.picture = new FileEntity(partial.picture);
  }

  pictureid: string;

  @ApiProperty()
  picture: FileEntity;

  @ApiProperty()
  status: $Enums.Status;

  @ApiProperty()
  role: $Enums.Role;

  @ApiProperty()
  name: string;

  @Exclude()
  password: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;
}
