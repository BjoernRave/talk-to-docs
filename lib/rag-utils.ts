import { Message } from 'ai'
import cheerio from 'cheerio'
import { LogLevel, log } from 'crawlee'
import { JSDOM } from 'jsdom'
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
import { ANSWER_TEMPLATE, CONDENSE_QUESTION_TEMPLATE } from './prompts'
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
  onEnd,
}: {
  question: string
  chatHistory: Message[]
  vectorStore: VectorStore
  onEnd?: (llmResponse: string) => any
}) => {
  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    streaming: true,
  })

  const standaloneQuestionChain = RunnableSequence.from([
    {
      question: (input: ConversationalRetrievalQAChainInput) => input.question,
      chat_history: (input: ConversationalRetrievalQAChainInput) =>
        formatVercelMessages(input.chat_history),
    },
    CONDENSE_QUESTION_TEMPLATE,
    model,
    new StringOutputParser(),
  ])

  const answerChain = RunnableSequence.from([
    {
      context: vectorStore.asRetriever().pipe(combineDocumentsFn),
      question: new RunnablePassthrough(),
    },
    ANSWER_TEMPLATE,
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
            if (!('llmOutput' in outputs) && onEnd) {
              onEnd(outputs.generations[0][0].text)
            }
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

const removeTrailingSlash = (url: string) =>
  url[url.length - 1] === '/' ? url.slice(0, -1) : url

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

  const cleanedUrl = removeTrailingSlash(url)

  const cleanedSmallestUrl = removeTrailingSlash(smallestUrl)

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

  if (pages.length === 0) {
    throw new Error('No pages found.')
  }

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

export const removeUnnecessaryNodes = async (
  doc: JSDOM,
  selectors: string[]
) => {
  for (const tagToRemove of selectors) {
    const elements = doc.window.document.querySelectorAll(tagToRemove)

    for (const element of elements) {
      element.remove()
    }
  }

  return doc
}

export const removeLinks = async (doc: JSDOM) => {
  const links = doc.window.document.querySelectorAll('a')

  for (const link of links) {
    const text = link.textContent
    if (text) {
      link.replaceWith(text)
    } else {
      link.remove()
    }
  }

  return doc
}

export function removeEmptyTextElements(doc: JSDOM) {
  const document = doc.window.document

  // Select all elements
  const allElements = document.querySelectorAll('*')

  // Loop through all elements to check if they contain text
  allElements.forEach((element) => {
    if (!element.textContent.trim()) {
      // If element has no text content, remove it
      element.parentNode.removeChild(element)
    }
  })

  // Return the updated HTML
  return doc
}

export const preprocessHtml = async ({
  html,
  url,
  preProcessors,
}: {
  html: string
  url: string
  preProcessors: ((doc: JSDOM) => Promise<JSDOM> | JSDOM)[]
}) => {
  const doc = new JSDOM(html, {
    url,
  })

  let cleanedDoc = doc

  for (const cleaner of preProcessors) {
    const newCleanedDoc = await cleaner(cleanedDoc)

    cleanedDoc = newCleanedDoc
  }

  return cleanedDoc.serialize()
}
