import History from '@/components/History'
import MessageComponent from '@/components/Message'
import PromptInput from '@/components/PromptInput'
import Settings from '@/components/Settings'
import { useQuery } from '@/lib/api-hooks'
import { Chat, Collection, Message } from '@prisma/client'
import { useQueryClient } from '@tanstack/react-query'
import { useChat } from 'ai/react'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'

const Home: NextPage<Props> = ({}) => {
  const { data } = useQuery<Collection[]>({
    route: '/collections/list',
    name: 'getCollection',
  })

  const [activeChat, setActiveChat] = useState<Chat & { messages: Message[] }>(
    null
  )
  const [collection, setCollection] = useState<Collection>(null)
  const queryClient = useQueryClient()

  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({
      api: '/api/chat/create',
      body: { collectionId: collection?.id, chatId: activeChat?.id },
      onFinish: () => queryClient.invalidateQueries(['getChats']),
    })

  useEffect(() => {
    if (activeChat) {
      setMessages(
        activeChat.messages.map((m) => ({
          content: m.content,
          role: m.type as any,
          id: String(m.id),
        }))
      )
    } else {
      setMessages([])
    }
  }, [activeChat])

  useEffect(() => {
    if (data?.length > 0) {
      setCollection(data[0])
    }
  }, [data])

  useEffect(() => {
    const input = document.querySelector(`#question`) as HTMLInputElement

    input?.focus()
  }, [])

  useEffect(() => {
    const input = document.querySelector('#chat-input') as HTMLInputElement

    input?.focus()
  }, [activeChat])

  return (
    <div className='flex h-[100vh] w-full'>
      <History
        setCollection={setCollection}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
      />
      <div className='flex w-full flex-col p-4'>
        <div className='flex-1 overflow-y-auto rounded-xl mb-2 bg-slate-200 p-4 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7'>
          {[
            {
              role: 'assistant' as const,
              content: `Go ahead and ask something about ${collection?.name}`,
              id: -1,
            },
            ...messages,
          ].map((m) => (
            <MessageComponent {...m} key={m.id} />
          ))}
        </div>

        <PromptInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
      <Settings
        setActiveChat={setActiveChat}
        activeChat={activeChat}
        setActiveCollection={setCollection}
        activeCollection={collection}
      />
    </div>
  )
}

export default Home

interface Props {}
