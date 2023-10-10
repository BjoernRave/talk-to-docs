import { prisma } from '@/lib/prisma'
import { addDocumentsToCollection } from '@/lib/rag-utils'
import { LogLevel, log } from 'crawlee'

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, name, smallestUrl } = req.body

  if (!url || !name || !smallestUrl) {
    return res.status(400).json({ error: 'Missing body parameter' })
  }

  const existingCollectionName = await prisma.collection.findFirst({
    where: {
      name,
    },
  })

  const existingCollectionUrl = await prisma.collection.findFirst({
    where: {
      url,
    },
  })

  if (existingCollectionName || existingCollectionUrl) {
    return res
      .status(400)
      .json({ error: 'Collection with that name or url already exists' })
  }

  log.setLevel(LogLevel.DEBUG)

  const { pages, documents } = await addDocumentsToCollection({
    name,
    url,
    smallestUrl,
  })

  res.status(200).json({
    success: true,
    documentCount: documents.length,
    pageCount: pages.length,
  })
}
