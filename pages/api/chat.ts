import { Message as VercelChatMessage, streamToResponse } from 'ai'
import { NextResponse } from 'next/server'

import { initVectorDB } from '@/lib/serverUtils'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { Document } from 'langchain/document'
import { PromptTemplate } from 'langchain/prompts'
import {
  BytesOutputParser,
  StringOutputParser,
} from 'langchain/schema/output_parser'
import {
  RunnablePassthrough,
  RunnableSequence,
} from 'langchain/schema/runnable'
import { NextApiRequest, NextApiResponse } from 'next'

type ConversationalRetrievalQAChainInput = {
  question: string
  chat_history: VercelChatMessage[]
}

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => doc.pageContent)
  return serializedDocs.join(separator)
}

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
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

const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`
const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
  condenseQuestionTemplate
)

const answerTemplate = `

Answer the question based only on the following context:
{context}

Question: {question}
`
const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate)

/**
 * This handler initializes and calls a retrieval chain. It composes the chain using
 * LangChain Expression Language. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = JSON.parse(req.body)
    const messages = body.messages ?? []
    const previousMessages = messages.slice(0, -1)
    const currentMessageContent = messages[messages.length - 1].content

    const model = new ChatOpenAI({
      modelName: 'gpt-4',
    })

    const vectorstore = await initVectorDB(body.collection)

    const retriever = vectorstore.asRetriever()

    /**
     * We use LangChain Expression Language to compose two chains.
     * To learn more, see the guide here:
     *
     * https://js.langchain.com/docs/guides/expression_language/cookbook
     */
    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) =>
          input.question,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          formatVercelMessages(input.chat_history),
      },
      CONDENSE_QUESTION_PROMPT,
      model,
      new StringOutputParser(),
    ])

    const answerChain = RunnableSequence.from([
      {
        context: retriever.pipe(combineDocumentsFn),
        question: new RunnablePassthrough(),
      },
      ANSWER_PROMPT,
      model,
      new BytesOutputParser(),
    ])

    const conversationalRetrievalQAChain =
      standaloneQuestionChain.pipe(answerChain)

    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: previousMessages,
    })

    return streamToResponse(stream, res)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
