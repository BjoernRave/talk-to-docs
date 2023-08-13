import { prisma } from '@/lib/prisma'
import { getCrawler, parseHtml } from '@/lib/serverUtils'
import { ChromaClient } from 'chromadb'
import { LogLevel, log } from 'crawlee'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { Chroma } from 'langchain/vectorstores/chroma'
import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, name } = req.body
  console.log(url)
  if (!url || !name) {
    return res.status(400).json({ error: 'Missing body parameter' })
  }

  log.setLevel(LogLevel.DEBUG)

  let pageCount = 0

  const documents = []

  const crawler = getCrawler({
    url,
    handleRequest: async ({ $, request }) => {
      const title = $('title').text()
      const body = $('body').clone()

      const newDocuments = await parseHtml(body.html(), title, request.url)

      pageCount += 1

      documents.push(...newDocuments)
    },
  })

  const cleanedUrl = url[url.length - 1] === '/' ? url.slice(0, -1) : url

  await crawler.run([cleanedUrl])
  log.debug('Crawler finished.')

  const client = new ChromaClient({
    path: 'http://localhost:8000',
  })

  await client.reset()

  await Chroma.fromDocuments(
    documents.filter((d) => Boolean(d.pageContent)),
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    {
      collectionName: name,
    }
  )

  console.log(
    `Created vector store ${name} with ${documents.length} documents.`
  )

  await prisma.collection.create({
    data: {
      name: name,
      url: url,
    },
  })

  res
    .status(200)
    .json({ success: true, documentCount: documents.length, pageCount })
}
