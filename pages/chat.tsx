import History from '@/components/History'
import Message from '@/components/Message'
import PromptInput from '@/components/PromptInput'
import Settings from '@/components/Settings'
import { useQuery } from '@/lib/api-hooks'
import { Collection } from '@prisma/client'
import { useChat } from 'ai/react'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'

const Home: NextPage<Props> = ({}) => {
  const { data } = useQuery<Collection[]>({
    route: '/collections/list',
    name: 'getCollection',
  })

  const [activeChat, setActiveChat] = useState(null)
  const [docs, setDocs] = useState(null)
  const activeDocs = data?.find((d) => d.id === docs)
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat/create',
    body: { collectionId: activeDocs?.id, chatId: activeChat?.id },
  })

  useEffect(() => {
    if (data?.length > 0) {
      setDocs(data[0].id)
    }
  }, [data])

  useEffect(() => {
    const input = document.querySelector(`#question`) as HTMLInputElement

    input?.focus()
  }, [])

  return (
    <div className='flex h-[100vh] w-full'>
      <History activeChat={activeChat} setActiveChat={setActiveChat} />
      <div className='flex w-full flex-col p-4'>
        <div className='flex-1 overflow-y-auto rounded-xl mb-2 bg-slate-200 p-4 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7'>
          {[
            {
              role: 'assistant' as const,
              content: `Go ahead and ask something about ${activeDocs?.name}`,
              id: -1,
            },
            ...messages,
          ].map((m) => (
            <Message {...m} key={m.id} />
          ))}
        </div>
        <PromptInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
      <Settings />
    </div>
  )
}

export default Home

interface Props {}
