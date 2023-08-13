import { useMutation } from '@/lib/api-hooks'
import { FC, useState } from 'react'
import Input from './Input'

const NewCollectionModal: FC<Props> = ({}) => {
  const modalName = 'collection-new-modal'
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const addCollection = useMutation({
    method: 'POST',
    route: '/collections/new',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    await addCollection({
      body: {
        url,
        name,
      },
    })
  }

  return (
    <>
      <button className='btn' onClick={() => window[modalName].showModal()}>
        Add Collection
      </button>
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
          <h3 className='font-bold text-lg'>Add Collection</h3>
          <form onSubmit={handleSubmit}>
            <Input
              label='Name der Dokumentation'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              label='URL der Dokumentation'
            />
            <button className='btn'>Submit</button>
          </form>
        </div>
      </dialog>
    </>
  )
}

export default NewCollectionModal

interface Props {}
