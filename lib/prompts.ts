import { PromptTemplate } from 'langchain/prompts'

const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`
export const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
  condenseQuestionTemplate
)

const answerInstructions = [
  'Answer the question in a helpful, productive way.',
  'The following context could be helpful. If there is nothing relevant in the context use your own knowledge: {context}',
  'If the question is unanswerable, answer with "I don\'t know".',
  'Question: {question}',
]

export const ANSWER_PROMPT = PromptTemplate.fromTemplate(
  answerInstructions.join('\n')
)
