import ChatContent from '@/components/ChatContent'
import Input from '@/components/Input'
import NewCollectionModal from '@/components/NewCollectionModal'
import Select from '@/components/Select'
import { useQuery } from '@/lib/api-hooks'
import { Collection } from '@prisma/client'
import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'

export default function Chat() {
  const { data } = useQuery<Collection[]>({
    route: '/collections/list',
    name: 'getCollection',
  })
  const [docs, setDocs] = useState(null)
  const activeDocs = data?.find((d) => d.id === docs)
  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
  } = useChat({
    body: { collection: activeDocs?.name },
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
    <div className='flex flex-col items-center h-screen'>
      <div className='flex flex-col fixed top-4 right-4'>
        <Select
          className='my-4'
          value={docs}
          onChange={(e) => {
            setDocs(Number(e.target.value))
            setMessages([])
            setInput('')
            const input = document.querySelector(
              `#question`
            ) as HTMLInputElement

            input?.focus()
          }}
          label='Dokumentation'
          options={data?.map((d) => ({ label: d.name, value: d.id }))}
        />

        <NewCollectionModal />
      </div>
      <div className='flex flex-grow flex-col w-full p-2 lg:w-[700px]'>
        <div className='flex-1 '>
          {[
            {
              role: 'AI',
              content: `Go ahead and ask something about ${activeDocs?.name}`,
              id: -1,
            },
            ...messages,
          ].map((m) => (
            <div
              key={m.id}
              className={`chat  ${
                m.role !== 'user' ? 'chat-start' : 'chat-end'
              }`}>
              <div className='chat-bubble'>
                <ChatContent content={m.content} />
              </div>
              <div className='chat-footer opacity-50'>
                {m.role === 'user' ? 'You' : 'AI'}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <Input
            id='question'
            value={input}
            placeholder='Ask you question here...'
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  )
}
