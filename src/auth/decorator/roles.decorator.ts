import { Reflector } from '@nestjs/core';
import { $Enums } from '@prisma/client';

export const Roles = Reflector.createDecorator<$Enums.Role[]>();
