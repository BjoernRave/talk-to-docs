import { useQuery } from '@/lib/api-hooks'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { Chat, Collection, Message } from '@prisma/client'
import { FC, useState } from 'react'
import NewCollectionModal from './NewCollectionModal'

const Settings: FC<Props> = ({
  activeChat,
  setActiveChat,
  activeCollection,
  setActiveCollection,
}) => {
  const [isAddingCollection, setIsAddingCollection] = useState(false)
  const { data } = useQuery<Collection[]>({
    name: 'getCollections',
    route: '/collections/list',
  })

  return (
    <div className='flex flex-row-reverse'>
      {/* Sidebar */}
      <aside className='flex '>
        <div className='relative rounded-lg px-2  w-60 overflow-y-auto border-l border-slate-300 bg-slate-50 py-8 dark:border-slate-700 dark:bg-slate-900 sm:w-64'>
          <div className='mb-4 flex items-center gap-x-2 px-2 text-slate-800 dark:text-slate-200'>
            <h2 className='text-lg font-medium'>Settings</h2>
          </div>
          <FormControl fullWidth>
            <InputLabel id='demo-simple-select-label'>Collection</InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              label='Collection'
              onChange={(c) => {
                setActiveCollection(data.find((d) => d.id === c.target.value))
                if (activeChat && activeChat.collectionId !== c.target.value) {
                  setActiveChat(null)
                }
              }}
              value={activeCollection ? activeCollection?.id : ''}>
              {data?.map((d) => (
                <MenuItem value={d.id} key={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            className='w-full !mt-4'
            onClick={() => setIsAddingCollection(true)}>
            Add Collection
          </Button>
        </div>
      </aside>
      {isAddingCollection && (
        <NewCollectionModal onClose={() => setIsAddingCollection(false)} />
      )}
    </div>
  )
}

export default Settings

interface Props {
  activeChat: Chat
  setActiveChat: (c: Chat & { messages: Message[] }) => void
  activeCollection: Collection
  setActiveCollection: (c: Collection) => void
}
