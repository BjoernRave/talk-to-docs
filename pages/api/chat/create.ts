import { prisma } from '@/lib/prisma'
import { answerChatQuestionWithContext } from '@/lib/rag-utils'
import { getServerAuthSession } from '@/lib/serverUtils'
import { Chunk, Prisma } from '@prisma/client'
import { streamToResponse } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { HumanMessage, SystemMessage } from 'langchain/schema'
import { PrismaVectorStore } from 'langchain/vectorstores/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerAuthSession({ req, res })

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const body = JSON.parse(req.body)
    const messages = body.messages ?? []
    const previousMessages = messages.slice(0, -1)
    const currentMessageContent = messages[messages.length - 1].content

    if (!body.collectionId) {
      throw new Error('No collectionId provided')
    }

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
        filter: {
          collectionId: {
            equals: body.collectionId,
          },
        },
      }
    )

    let chatId

    if (!body.chatId) {
      const llm = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
      })

      const res = await llm.invoke([
        new SystemMessage(
          'You are specialized in summarizing a question to a heading. Only return the heading.'
        ),
        new HumanMessage(currentMessageContent),
      ])

      const chat = await prisma.chat.create({
        data: {
          name: res.content,
          collection: {
            connect: {
              id: body.collectionId,
            },
          },
          user: {
            connect: {
              id: (session.user as any).id,
            },
          },
        },
      })

      chatId = chat.id
    } else {
      chatId = body.chatId
    }

    const stream = await answerChatQuestionWithContext({
      question: currentMessageContent,
      chatHistory: previousMessages,
      vectorStore,
      onEnd: async (llmResponse) => {
        await prisma.chat.update({
          where: {
            id: chatId,
          },
          data: {
            messages: {
              create: [
                {
                  content: currentMessageContent,
                  type: 'user',
                },
                {
                  content: llmResponse,
                  type: 'assistant',
                },
              ],
            },
          },
        })
      },
    })

    streamToResponse(stream, res)
  } catch (e: any) {
    console.error(e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
