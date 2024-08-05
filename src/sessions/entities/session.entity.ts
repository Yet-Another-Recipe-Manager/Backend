import { ApiProperty } from '@nestjs/swagger';
import { Session } from '@prisma/client';

export class SessionEntity implements Session {
  constructor(partial: Partial<SessionEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  hash: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  userId: string;
}
