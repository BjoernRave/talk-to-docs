import { useQuery } from '@/lib/api-hooks'
import { Chat } from '@prisma/client'
import { FC } from 'react'

const History: FC<Props> = ({ activeChat, setActiveChat }) => {
  const { data } = useQuery<Chat[]>({
    name: 'getChats',
    route: '/chat/list',
  })

  return (
    <>
      {/* Prompt history panel */}
      <div className='max-w-xl w-[300px] rounded-lg border border-slate-300 bg-slate-50 py-8 dark:border-slate-200/10 dark:bg-slate-900'>
        <div className='flex items-start'>
          <h2 className='inline px-5 text-lg font-medium text-slate-800 dark:text-slate-200'>
            Chats
          </h2>
          <span className='rounded-full bg-blue-600 px-2 py-1 text-xs text-slate-200'>
            {data?.length}
          </span>
        </div>

        {/* Give the following container a height to make it scrollable such as: h-80 */}
        <div className='my-4 max-h-80 space-y-4 overflow-y-auto px-2'>
          {data?.map((c) => (
            <button
              onClick={() => setActiveChat(c)}
              key={c.id}
              className='flex w-full flex-col gap-y-2 rounded-lg px-3 py-2 text-left transition-colors duration-200 hover:bg-slate-200 focus:outline-none dark:hover:bg-slate-800'>
              <h1 className='text-sm font-medium capitalize text-slate-700 dark:text-slate-200'>
                {c.name}
              </h1>
            </button>
          ))}
        </div>
        <div className='mx-2 mt-6'>
          <button
            onClick={() => setActiveChat(null)}
            className='flex w-full flex-row-reverse justify-between rounded-lg bg-slate-600 p-4 text-sm font-medium text-slate-200 transition-colors duration-200 hover:bg-blue-600 focus:outline-none dark:bg-slate-800 dark:hover:bg-blue-600'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
              <path d='M12 5l0 14'></path>
              <path d='M5 12l14 0'></path>
            </svg>
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default History

interface Props {
  activeChat: Chat
  setActiveChat: (chat: Chat) => void
}
