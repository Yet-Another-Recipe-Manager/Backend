import { SessionEntity } from 'src/sessions/entities/session.entity';
import { UserEntity } from 'src/users/entities/user.entity';

export type JwtPayloadType = Pick<UserEntity, 'id' | 'role'> & {
  sessionID: SessionEntity['id'];
  iat: number;
  exp: number;
};
