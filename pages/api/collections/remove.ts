import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.query

  await prisma.collection.delete({
    where: {
      name: name as string,
    },
  })

  res.status(200).json({ message: 'Collection deleted' })
}
