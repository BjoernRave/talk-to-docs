import { useMutation } from '@/lib/api-hooks'
import { FC, useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from './Button'
import Input from './Input'

const NewCollectionModal: FC<Props> = ({}) => {
  const modalName = 'collection-new-modal'
  const [url, setUrl] = useState('')
  const [smallestUrl, setSmallestUrl] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addCollection = useMutation({
    method: 'POST',
    route: '/collections/new',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    await addCollection({
      body: {
        url,
        name,
        smallestUrl,
      },
      onSuccess: () => {
        toast.success('Successfully added the documentation')
        window[modalName].close()
        setName('')
        setUrl('')
        setSmallestUrl('')
      },
    })

    setIsLoading(false)
  }

  return (
    <>
      <Button onClick={() => window[modalName].showModal()}>
        Add Documentation
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-6 h-6'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 4.5v15m7.5-7.5h-15'
          />
        </svg>
      </Button>
      <dialog id={modalName} className='modal'>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
        <div className='modal-box'>
          <form method='dialog'>
            <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
              ✕
            </button>
          </form>
          <h3 className='font-bold text-lg'>Add Documentation</h3>
          <form className='mt-4' onSubmit={handleSubmit}>
            <Input
              required
              label='Name of the documentation'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              required
              type='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              label='Url to the intro page of the documentation'
            />
            <Input
              required
              type='url'
              value={smallestUrl}
              onChange={(e) => setSmallestUrl(e.target.value)}
              label='Smallest url to the documentation'
            />
            <p>
              For example when trying to add the documentation of Zustand, the
              url would be
              "https://docs.pmnd.rs/zustand/getting-started/introduction",
              because that's the intro page, but the smallest url would be
              "https://docs.pmnd.rs/zustand". This is to make sure only relevant
              data is scraped.
            </p>
            <Button className='mt-4' isLoading={isLoading}>
              Add Documentation{' '}
            </Button>
          </form>
        </div>
      </dialog>
    </>
  )
}

export default NewCollectionModal

interface Props {}
