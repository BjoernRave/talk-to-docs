import { Message } from 'ai'
import { Document } from 'langchain/document'

export type Page = {
  title: string
  documents: Document[]
  url: string
  content: string
}

export type ConversationalRetrievalQAChainInput = {
  question: string
  chat_history: Message[]
}

export interface Option {
  label: string
  value: string | Number
  icon?: string
}

export type ChatRole = 'user' | 'assistant' | 'function' | 'system'
