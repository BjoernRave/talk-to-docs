import { ChromaClient } from 'chromadb'
import { CheerioCrawler, CheerioCrawlingContext, LogLevel, log } from 'crawlee'
import { RetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { Chroma } from 'langchain/vectorstores/chroma'
import { parseHtml } from '../lib/serverUtils'

require('dotenv').config()

const getCrawler = ({
  url,
  handleRequest,
}: {
  url: string
  handleRequest: (ctx: CheerioCrawlingContext) => Promise<void>
}) => {
  const crawler = new CheerioCrawler({
    maxConcurrency: 2,
    maxRequestsPerMinute: 50,
    maxRequestRetries: 1,
    requestHandlerTimeoutSecs: 30,
    maxRequestsPerCrawl: 500,
    async requestHandler(ctx) {
      log.debug(`Processing ${ctx.request.url}...`)

      await handleRequest(ctx)

      await ctx.enqueueLinks({
        globs: [`${url}/**`],
      })
    },
    failedRequestHandler({ request }) {
      log.debug(`Request ${request.url} failed twice.`)
    },
  })

  return crawler
}

async function createCollection({ url, name }: { url: string; name: string }) {
  log.setLevel(LogLevel.DEBUG)

  const documents = []

  const crawler = getCrawler({
    url,
    handleRequest: async ({ $, request }) => {
      const title = $('title').text()
      const body = $('body').clone()

      const newDocuments = await parseHtml(body.html(), title, request.url)

      documents.push(...newDocuments)
    },
  })

  await crawler.run([url])
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
}

async function queryWithVectorStore({
  query,
  collection,
}: {
  query: string
  collection: string
}) {
  const vectorStore = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings(),
    { collectionName: collection }
  )

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY as string,
    modelName: 'gpt-4',
    verbose: true,
  })

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever())
  const res = await chain.call({
    query,
    verbose: true,
  })
  console.log({ res })
}

// createCollection({ url: 'https://docs.pmnd.rs/zustand', name: 'zustand' })

queryWithVectorStore({
  query: 'How can I reset the state of Zustand?',
  collection: 'zustand',
})
