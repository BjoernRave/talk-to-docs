import { useQuery } from '@/lib/api-hooks'
import { Button, List, ListItemButton, ListItemText } from '@mui/material'
import { Chat, Collection, Message } from '@prisma/client'
import { FC, useEffect } from 'react'
import { usePrevious } from 'react-use'

const History: FC<Props> = ({ activeChat, setActiveChat, setCollection }) => {
  const { data } = useQuery<
    (Chat & { messages: Message[]; collection: Collection })[]
  >({
    name: 'getChats',
    route: '/chat/list',
  })
  const previousChats = usePrevious(data)

  useEffect(() => {
    if (!data || !previousChats) return

    if (data.length > previousChats.length && !activeChat) {
      setActiveChat(data[data.length - 1])
    }
  }, [data, previousChats])

  return (
    <>
      {/* Prompt history panel */}
      <div className='max-w-xl w-[300px] rounded-lg border  py-8 border-slate-200/10 bg-slate-900'>
        <div className='flex items-center'>
          <h2 className='inline px-5 text-lg font-medium text-slate-200'>
            Chats
          </h2>
          <span className='rounded-full bg-blue-600 px-2 py-1 text-xs text-slate-200'>
            {data?.length}
          </span>
        </div>
        <div className='mx-2 mt-6'>
          <Button
            className='w-full'
            endIcon={
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
            }
            onClick={() => setActiveChat(null)}>
            <span>New Chat</span>
          </Button>
        </div>
        <List className='!mt-4'>
          {data?.map((c) => {
            const isActive = activeChat?.id === c.id
            return (
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  setActiveChat(c)
                  setCollection(c.collection)
                }}
                key={c.id}>
                <ListItemText primary={c.name} secondary={c.collection.name} />
              </ListItemButton>
            )
          })}
        </List>
      </div>
    </>
  )
}

export default History

interface Props {
  activeChat: Chat & { messages: Message[] }
  setActiveChat: (chat: Chat & { messages: Message[] }) => void
  setCollection: (collection: Collection) => void
}
