import NewCollectionModal from '@/components/NewCollectionModal'
import { useQuery } from '@/lib/api-hooks'
import { useChat } from 'ai/react'
import { useState } from 'react'

export default function Chat() {
  const { data } = useQuery({
    route: '/collections/list',
    name: 'getCollection',
  })
  const [docs, setDocs] = useState('zustand')
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: { collection: docs },
  })

  return (
    <div>
      <select className='select select-bordered w-full max-w-xs'>
        <option disabled selected>
          Who shot first?
        </option>
        <option>Han Solo</option>
        <option>Greedo</option>
      </select>
      <NewCollectionModal />

      <div className='flex flex-col w-full max-w-md py-24 mx-auto stretch'>
        {messages.length > 0
          ? messages.map((m) => (
              <div key={m.id} className='whitespace-pre-wrap'>
                {m.role === 'user' ? 'User: ' : 'AI: '}
                {m.content}
              </div>
            ))
          : null}
        <form onSubmit={handleSubmit}>
          <input
            className='fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl'
            value={input}
            placeholder='Say something...'
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  )
}
