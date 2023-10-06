import { Message } from 'ai'
import cheerio from 'cheerio'
import { LogLevel, log } from 'crawlee'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { VectorStore } from 'langchain/dist/vectorstores/base'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import {
  BytesOutputParser,
  StringOutputParser,
} from 'langchain/schema/output_parser'
import {
  RunnablePassthrough,
  RunnableSequence,
} from 'langchain/schema/runnable'
import { PrismaVectorStore } from 'langchain/vectorstores/prisma'
import { Chunk, Prisma, prisma } from './prisma'
import { ANSWER_PROMPT, CONDENSE_QUESTION_PROMPT } from './prompts'
import {
  combineDocumentsFn,
  formatVercelMessages,
  getCrawler,
  parseHtml,
} from './serverUtils'
import { ConversationalRetrievalQAChainInput, Page } from './types'

export const answerChatQuestionWithContext = async ({
  question,
  chatHistory,
  vectorStore,
}: {
  question: string
  chatHistory: Message[]
  vectorStore: VectorStore
}) => {
  const model = new ChatOpenAI({
    modelName: 'gpt-4',
  })

  /**
   * We use LangChain Expression Language to compose two chains.
   * To learn more, see the guide here:
   *
   * https://js.langchain.com/docs/guides/expression_language/cookbook
   */
  const standaloneQuestionChain = RunnableSequence.from([
    {
      question: (input: ConversationalRetrievalQAChainInput) => input.question,
      chat_history: (input: ConversationalRetrievalQAChainInput) =>
        formatVercelMessages(input.chat_history),
    },
    CONDENSE_QUESTION_PROMPT,
    model,
    new StringOutputParser(),
  ])

  const answerChain = RunnableSequence.from([
    {
      context: vectorStore.asRetriever().pipe(combineDocumentsFn),
      question: new RunnablePassthrough(),
    },
    ANSWER_PROMPT,
    model,
    new BytesOutputParser(),
  ])

  const conversationalRetrievalQAChain =
    standaloneQuestionChain.pipe(answerChain)

  const stream = await conversationalRetrievalQAChain.stream(
    {
      question,
      chat_history: chatHistory,
    },
    {
      callbacks: [
        {
          handleLLMEnd: (outputs) => {
            console.log('outputs', outputs.generations)
          },
        },
      ],
    }
  )

  return stream
}

export const getCollection = async ({
  name,
  url,
  pages,
}: {
  name: string
  url: string
  pages: { title: string; content: string; url: string }[]
}) => {
  const collection = await prisma.collection.findUnique({
    where: {
      name,
      url,
    },
  })

  if (collection) {
    return collection
  }

  return prisma.collection.create({
    data: {
      name,
      url,
      pages: {
        create: pages.map((p) => ({
          content: p.content,
          title: p.title,
          url: p.url,
        })),
      },
    },
  })
}

export async function addDocumentsToCollection({
  url,
  name,
  smallestUrl,
}: {
  url: string
  name: string
  smallestUrl: string
}) {
  log.setLevel(LogLevel.DEBUG)

  const pages: Page[] = []

  const cleanedUrl = url[url.length - 1] === '/' ? url.slice(0, -1) : url

  const cleanedSmallestUrl =
    smallestUrl[smallestUrl.length - 1] === '/'
      ? smallestUrl.slice(0, -1)
      : smallestUrl

  const crawler = getCrawler({
    url: cleanedUrl,
    handleRequest: async (html, url) => {
      const $ = cheerio.load(html)

      const title = $('title').text()
      const body = $('body').clone()

      const newDocuments = await parseHtml(body.html(), title, url)

      pages.push({
        title,
        url,
        documents: newDocuments,
        content: body.html(),
      })
    },
    enqueueGlobs: [`${cleanedSmallestUrl}/**`],
  })

  await crawler.run([url])
  log.debug('Crawler finished.')

  const documents = pages
    .flatMap((p) => p.documents)
    .filter((d) => Boolean(d?.pageContent))

  const collection = await getCollection({ name, url, pages })

  const createdChunks = await prisma.$transaction(
    documents.map((document) =>
      prisma.chunk.create({
        data: {
          content: document.pageContent,
          collection: {
            connect: {
              id: collection.id,
            },
          },
        },
      })
    )
  )

  const vectorStore = PrismaVectorStore.withModel<Chunk>(prisma).create(
    new OpenAIEmbeddings(),
    {
      prisma: Prisma,
      tableName: 'Chunk',
      vectorColumnName: 'vector',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    }
  )

  await vectorStore.addModels(createdChunks)

  console.log(
    `Created vector store ${name} with ${documents.length} documents.`
  )

  return { collection, pages, documents }
}
