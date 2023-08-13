/// pages/api/chat.ts

import { LangChainStream, Message, streamToResponse } from 'ai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import {
  AIMessage,
  FunctionMessage,
  HumanMessage,
  SystemMessage,
} from 'langchain/schema'
import { Chroma } from 'langchain/vectorstores/chroma'
import { NextApiRequest, NextApiResponse } from 'next'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const json = JSON.parse(req.body)
  const messages: Message[] = json.messages

  const vectorStore = await initVectorDB('zustand')

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY as string,
    modelName: 'gpt-3.5-turbo-16k-0613',
  })

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {}
  )

  const { stream, handlers } = LangChainStream()

  const { langChainMessages, question } = convertMessagesToLangChain(messages)

  chain
    .call(
      {
        chat_history: langChainMessages,
        question,
      },
      {
        callbacks: [handlers],
      }
    )
    .catch(console.error)

  return streamToResponse(stream, res)
}
