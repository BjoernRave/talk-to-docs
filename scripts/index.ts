import { prisma } from '@/lib/prisma'
import { Chunk, Prisma } from '@prisma/client'
import { RetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PrismaVectorStore } from 'langchain/vectorstores/prisma'

require('dotenv').config()

async function queryWithVectorStore({
  query,
  collectionId,
}: {
  query: string
  collectionId: number
}) {
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
          equals: collectionId,
        },
      },
    }
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
