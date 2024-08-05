import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessionsRepository } from './sessions.repository';

@Module({
  providers: [SessionsService, SessionsRepository],
  imports: [PrismaModule],
  exports: [SessionsService],
})
export class SessionsModule {}
