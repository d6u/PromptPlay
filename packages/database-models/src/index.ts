import { PrismaClient } from '@prisma/client';

export {
  BatchTestPresetConfigDataSchemaVersion,
  CanvasDataSchemaVersion,
  PrismaClient,
  UserType,
} from '@prisma/client';

export const prismaClient = new PrismaClient();
