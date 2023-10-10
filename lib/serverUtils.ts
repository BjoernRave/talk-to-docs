import { authOptions as nextAuthOptions } from '@/pages/api/auth/[...nextauth]'
import { Readability } from '@mozilla/readability'
import { Message } from 'ai'
import { PlaywrightCrawler, log } from 'crawlee'
import { JSDOM } from 'jsdom'
import { Document } from 'langchain/document'
import {
  AIMessage,
  FunctionMessage,
  HumanMessage,
  SystemMessage,
} from 'langchain/schema'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { ParseResult } from 'mozilla-readability'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { tagsToRemove } from './data'
import {
  preprocessHtml,
  removeEmptyTextElements,
  removeLinks,
  removeUnnecessaryNodes,
} from './rag-utils'

// Next API route example - /pages/api/restricted.ts
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return await getServerSession(ctx.req, ctx.res, nextAuthOptions)
}

export const splitText = async (text: string) => {
  const splitter = new RecursiveCharacterTextSplitter({})

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

  const preProcessedHtml = await preprocessHtml({
    html,
    url,
    preProcessors: [
      (doc) => removeUnnecessaryNodes(doc, tagsToRemove),
      removeLinks,
      removeEmptyTextElements,
    ],
  })

  const text = transformHtmlToText(preProcessedHtml, url)

  const documents = await splitText(text)

  return documents
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
  enqueueGlobs,
  handleRequest,
}: {
  url: string
  handleRequest: (html: string, url: string) => Promise<void>
  enqueueGlobs: string[]
}) => {
  const urlObj = new URL(url)

  const crawler = new PlaywrightCrawler({
    maxConcurrency: 2,
    maxRequestsPerMinute: 50,
    maxRequestRetries: 1,
    requestHandlerTimeoutSecs: 30,
    maxRequestsPerCrawl: 500,
    async requestHandler({ page, request, enqueueLinks }) {
      log.debug(`Processing ${request.url}`)
      await page.locator('body').waitFor()

      const actorCard = page.locator('body')
      // Upon calling one of the locator methods Playwright
      // waits for the element to render and then accesses it.

      const actorText = await actorCard?.textContent()

      await handleRequest(actorText, request.url)

      await enqueueLinks({
        globs: enqueueGlobs,
        baseUrl: urlObj.origin,
      })
    },
    failedRequestHandler({ request }) {
      log.debug(`Request ${request.url} failed twice.`)
    },
  })

  return crawler
}

export const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => doc.pageContent)
  return serializedDocs.join(separator)
}

export const formatVercelMessages = (chatHistory: Message[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === 'user') {
      return `Human: ${message.content}`
    } else if (message.role === 'assistant') {
      return `Assistant: ${message.content}`
    } else {
      return `${message.role}: ${message.content}`
    }
  })
  return formattedDialogueTurns.join('\n')
}
