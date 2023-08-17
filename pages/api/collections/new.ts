import { prisma } from '@/lib/prisma'
import { getCrawler, parseHtml } from '@/lib/serverUtils'
import { Page } from '@/lib/types'
import cheerio from 'cheerio'
import { LogLevel, log } from 'crawlee'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { Chroma } from 'langchain/vectorstores/chroma'
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

  const cleanedUrl = url[url.length - 1] === '/' ? url.slice(0, -1) : url

  const cleanedSmallestUrl =
    smallestUrl[smallestUrl.length - 1] === '/'
      ? smallestUrl.slice(0, -1)
      : smallestUrl

  const pages: Page[] = []

  const crawler = getCrawler({
    enqueueGlobs: [`${cleanedSmallestUrl}/**`],
    url: cleanedUrl,

    handleRequest: async (html, url) => {
      const $ = cheerio.load(html)

      const title = $('title').text()
      const body = $('body').clone()

      console.log('html', body.html().length)

      const newDocuments = await parseHtml(body.html(), title, url)

      pages.push({
        title,
        url,
        documents: newDocuments,
        content: body.html(),
      })
    },
  })

  await crawler.run([cleanedUrl])
  log.debug('Crawler finished.')

  if (pages.length === 0) {
    return res.status(400).json({ error: 'No pages found' })
  }

  const documents = pages
    .flatMap((p) => p.documents)
    .filter((d) => Boolean(d?.pageContent))

  await Chroma.fromDocuments(
    documents,
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
      pages: {
        create: pages.map((p) => ({
          content: p.content,
          title: p.title,
          url: p.url,
        })),
      },
    },
  })

  res.status(200).json({
    success: true,
    documentCount: documents.length,
    pageCount: pages.length,
  })
}
