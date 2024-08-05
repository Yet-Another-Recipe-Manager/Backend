import { Injectable } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionEntity } from './entities/session.entity';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async create(createSessionDto: CreateSessionDto): Promise<SessionEntity> {
    const session = await this.sessionsRepository.create({
      hash: createSessionDto.hash,
      user: {
        connect: {
          id: createSessionDto.userID,
        },
      },
    });

    return new SessionEntity(session);
  }

  async findByID(id: string): Promise<SessionEntity> {
    const session = await this.sessionsRepository.findOne({ id: id });

    return new SessionEntity(session);
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<SessionEntity> {
    const session = await this.sessionsRepository.update(
      { id: id },
      updateSessionDto,
    );

    return new SessionEntity(session);
  }

  async deleteByID(id: string): Promise<SessionEntity> {
    const session = await this.sessionsRepository.remove({ id });

    return new SessionEntity(session);
  }

  async deleteByUserID(userID: string): Promise<number> {
    const removedCount = await this.sessionsRepository.removeMany({
      user: { id: userID },
    });

    return removedCount.count;
  }
}
