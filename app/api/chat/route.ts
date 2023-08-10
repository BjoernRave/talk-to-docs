/// app/api/chat/royte.ts

import { Message, StreamingTextResponse } from 'ai'
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

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const json = await req.json()
  const messages: Message[] = json.messages

  const vectorStore = await initVectorDB('zustand')

  console.log(messages)
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY as string,
    modelName: 'gpt-3.5-turbo-16k-0613',
  })

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {}
  )
  const { langChainMessages, question } = convertMessagesToLangChain(messages)
  console.log(langChainMessages, question, 'question')
  const stream = await chain.stream({
    chat_history: langChainMessages,
    question,
  })

  return new StreamingTextResponse(stream)
}
