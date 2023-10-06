import { useQuery } from '@/lib/api-hooks'
import { Chat, Collection } from '@prisma/client'
import { FC } from 'react'

const Settings: FC<Props> = ({
  activeChat,
  activeCollection,
  setActiveCollection,
}) => {
  const { data } = useQuery<Collection[]>({
    name: 'getCollections',
    route: '/collections/list',
  })

  return (
    <div className='flex flex-row-reverse'>
      {/* Sidebar */}
      <aside className='flex '>
        <div className='relative rounded-lg  w-60 overflow-y-auto border-l border-slate-300 bg-slate-50 py-8 dark:border-slate-700 dark:bg-slate-900 sm:w-64'>
          <div className='mb-4 flex items-center gap-x-2 px-2 text-slate-800 dark:text-slate-200'>
            <button className='inline-flex rounded-lg p-1 hover:bg-slate-700'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                strokeWidth='2'
                stroke='currentColor'
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
                <path d='M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z'></path>
                <path d='M9 4v16'></path>
                <path d='M14 10l2 2l-2 2'></path>
              </svg>
              <span className='sr-only'>Close settings sidebar</span>
            </button>
            <h2 className='text-lg font-medium'>Settings</h2>
          </div>

          {/* Select */}
          <div className='px-2 py-4 text-slate-800 dark:text-slate-200'>
            <label htmlFor='select-mode' className='px-2 text-sm font-medium'>
              Collection
            </label>
            <select
              onChange={(c) =>
                setActiveCollection(
                  data.find((d) => String(d.id) === c.target.value)
                )
              }
              value={activeCollection?.id}
              name='select-mode'
              id='select-mode'
              className='mt-2 w-full cursor-pointer rounded-lg border-r-4 border-transparent bg-slate-200 py-3 pl-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-800'>
              {data?.map((d) => (
                <option value={d.id} key={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Settings

interface Props {
  activeChat: Chat
  activeCollection: Collection
  setActiveCollection: (c: Collection) => void
}
