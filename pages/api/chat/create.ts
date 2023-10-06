import { prisma } from '@/lib/prisma'
import { answerChatQuestionWithContext } from '@/lib/raq-utils'
import { getServerAuthSession } from '@/lib/serverUtils'
import { Chunk, Prisma } from '@prisma/client'
import { streamToResponse } from 'ai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
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
          collectionId: body.collectionId,
        },
      }
    )

    const stream = await answerChatQuestionWithContext({
      question: currentMessageContent,
      chatHistory: previousMessages,
      vectorStore,
    })

    let chunks = ''

    for await (const chunk of stream) {
      chunks += chunk.toString()
    }

    return streamToResponse(stream, res)
  } catch (e: any) {
    console.error(e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
