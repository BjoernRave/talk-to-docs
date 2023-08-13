import { PrismaClient } from '@prisma/client'

export const prisma = (global.prisma as PrismaClient) || new PrismaClient()

export * from '@prisma/client'

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
