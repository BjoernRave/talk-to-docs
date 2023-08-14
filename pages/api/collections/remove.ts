import { prisma } from '@/lib/prisma'
import { ChromaClient } from 'chromadb'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.query

  const client = new ChromaClient()

  await client.deleteCollection({ name: name as string })

  await prisma.collection.delete({
    where: {
      name: name as string,
    },
  })

  res.status(200).json({ message: 'Collection deleted' })
}
