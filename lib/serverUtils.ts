import { Readability } from '@mozilla/readability'
import { Message } from 'ai'
import { CheerioCrawler, CheerioCrawlingContext, log } from 'crawlee'
import { JSDOM } from 'jsdom'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import {
  AIMessage,
  FunctionMessage,
  HumanMessage,
  SystemMessage,
} from 'langchain/schema'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { Chroma } from 'langchain/vectorstores/chroma'
import { ParseResult } from 'mozilla-readability'

export const splitText = async (text: string) => {
  const chunkSize = 2000
  const splitter = new TokenTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: 200,
  })

  return splitter.createDocuments([text])
}

export const transformHtmlToText = (html: string, url: string) => {
  const doc = new JSDOM(html, {
    url,
  })

  const reader = new Readability(doc.window.document)

  const article: ParseResult = reader.parse()

  return article.textContent
}

export const parseHtml = async (html: string, title: string, url: string) => {
  if (!html) return Promise.resolve([])

  const text = transformHtmlToText(html, url)

  const documents = await splitText(text)

  return documents
}

export const initVectorDB = async (collection: string) => {
  const vectorStore = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings(),
    { collectionName: collection }
  )

  return vectorStore
}

export const convertMessagesToLangChain = (messages: Message[]) => {
  const allMessages = [...messages]
  const lastMessage = allMessages.splice(-1, 1)

  const newMessages = []

  for (const message of allMessages) {
    if (message.role === 'user') {
      newMessages.push(new HumanMessage(message.content))
    } else if (message.role === 'assistant') {
      newMessages.push(new AIMessage(message.content))
    } else if (message.role === 'function') {
      newMessages.push(new SystemMessage(message.content))
    } else {
      newMessages.push(new FunctionMessage(message.content, message.name))
    }
  }

  return {
    langChainMessages: newMessages,
    question: lastMessage[0].content,
  }
}

export const getCrawler = ({
  url,
  handleRequest,
}: {
  url: string
  handleRequest: (ctx: CheerioCrawlingContext) => Promise<void>
}) => {
  const urlObj = new URL(url)

  console.log(urlObj)

  const crawler = new CheerioCrawler({
    maxConcurrency: 2,
    maxRequestsPerMinute: 50,
    maxRequestRetries: 1,
    requestHandlerTimeoutSecs: 30,
    maxRequestsPerCrawl: 500,
    async requestHandler(ctx) {
      log.debug(`Processing ${ctx.request.url}`)

      await handleRequest(ctx)

      await ctx.enqueueLinks({
        strategy: 'same-hostname',
      })
    },
    failedRequestHandler({ request }) {
      log.debug(`Request ${request.url} failed twice.`)
    },
  })

  return crawler
}
