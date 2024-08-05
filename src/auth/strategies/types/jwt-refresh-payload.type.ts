import { SessionEntity } from 'src/sessions/entities/session.entity';

export type JwtRefreshPayloadType = {
  sessionID: SessionEntity['id'];
  hash: SessionEntity['hash'];
  iat: number;
  exp: number;
};
