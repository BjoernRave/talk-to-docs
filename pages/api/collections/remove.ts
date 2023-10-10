import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.query

  const chat = await prisma.chat.findMany({
    where: {
      collection: {
        name: name as string,
      },
    },
  })

  await prisma.message.deleteMany({
    where: {
      chat: {
        id: {
          in: chat.map((c) => c.id),
        },
      },
    },
  })

  await prisma.chat.deleteMany({
    where: {
      collection: {
        name: name as string,
      },
    },
  })

  await prisma.chunk.deleteMany({
    where: {
      collection: {
        name: name as string,
      },
    },
  })

  await prisma.sourcePage.deleteMany({
    where: {
      collection: {
        name: name as string,
      },
    },
  })

  await prisma.collection.delete({
    where: {
      name: name as string,
    },
  })

  res.status(200).json({ message: 'Collection deleted' })
}
