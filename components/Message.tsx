import { ChatRole } from '@/lib/types'
import { FC } from 'react'
import ChatContent from './ChatContent'

const Message: FC<Props> = ({ content, role }) => {
  if (role === 'user') {
    return (
      <div className='flex flex-row px-2 py-4 sm:px-4'>
        <img
          className='mr-2 flex h-8 w-8 rounded-full sm:mr-4'
          src='https://dummyimage.com/256x256/363536/ffffff&text=U'
        />

        <div className='flex  items-center'>
          <ChatContent content={content} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='mb-2 flex w-full flex-row justify-end gap-x-2 text-slate-500'>
        <button className='hover:text-blue-600'>
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
            <path d='M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3'></path>
          </svg>
        </button>
        <button className='hover:text-blue-600' type='button'>
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
            <path d='M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3'></path>
          </svg>
        </button>
        <button className='hover:text-blue-600' type='button'>
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
            <path d='M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z'></path>
            <path d='M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2'></path>
          </svg>
        </button>
      </div>
      <div className='mb-4 flex rounded-xl bg-slate-50 px-2 py-6 dark:bg-slate-900 sm:px-4'>
        <img
          className='mr-2 flex h-8 w-8 rounded-full sm:mr-4'
          src='https://dummyimage.com/256x256/354ea1/ffffff&text=G'
        />

        <div className='flex items-center rounded-xl'>
          <ChatContent content={content} />
        </div>
      </div>
    </>
  )
}

export default Message

interface Props {
  content: string
  role: ChatRole
}
