import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const collections = await prisma.collection.findMany()

  res.status(200).json({
    collections,
  })
}
