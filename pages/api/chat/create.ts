import { streamToResponse } from 'ai'
import { NextResponse } from 'next/server'

import {
  combineDocumentsFn,
  formatVercelMessages,
  getServerAuthSession,
  initVectorDB,
} from '@/lib/serverUtils'
import { ConversationalRetrievalQAChainInput } from '@/lib/types'
import { ChatOpenAI } from 'langchain/chat_models/openai'
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

const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`
const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
  condenseQuestionTemplate
)

const answerInstructions = [
  'Answer the question in a helpful, productive way.',
  'The following context could be helpful: {context}',
  'If the question is unanswerable, answer with "I don\'t know".',
  'Question: {question}',
]

const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerInstructions.join('\n'))

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
    const session = await getServerAuthSession({ req, res })

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const body = JSON.parse(req.body)
    const messages = body.messages ?? []
    const previousMessages = messages.slice(0, -1)
    const currentMessageContent = messages[messages.length - 1].content

    const model = new ChatOpenAI({
      modelName: 'gpt-4',
    })

    const vectorStore = await initVectorDB(body.collection)

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
        context: vectorStore.asRetriever().pipe(combineDocumentsFn),
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
    console.error(e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
