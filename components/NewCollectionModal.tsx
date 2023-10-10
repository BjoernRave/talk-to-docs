import { useMutation } from '@/lib/api-hooks'
import { FormModal, TextInput } from 'rave-ui'
import { FC } from 'react'
import { toast } from 'react-hot-toast'
import z from 'zod'

const NewCollectionSchema = z.object({
  url: z.string().url(),
  smallestUrl: z.string().url(),
  name: z.string(),
})

const NewCollectionModal: FC<Props> = ({ onClose }) => {
  const addCollection = useMutation({
    method: 'POST',
    route: '/collections/new',
  })

  const handleSubmit = async ({ url, smallestUrl, name }) => {
    await addCollection({
      body: {
        url,
        smallestUrl,
        name,
      },
      onSuccess: () => {
        toast.success('Successfully added the documentation')
        onClose()
      },
    })
  }

  return (
    <FormModal
      initialValues={{
        url: '',
        smallestUrl: '',
        name: '',
      }}
      validationSchema={NewCollectionSchema}
      onSubmit={handleSubmit}
      onClose={onClose}
      title='Add Documentation'>
      <TextInput label='Name of the documentation' name='name' />
      <TextInput
        type='url'
        name='url'
        label='Url to the intro page of the documentation'
      />
      <TextInput
        type='url'
        name='smallestUrl'
        label='Smallest url to the documentation'
      />
      <p>
        For example when trying to add the documentation of Zustand, the url
        would be "https://docs.pmnd.rs/zustand/getting-started/introduction",
        because that's the intro page, but the smallest url would be
        "https://docs.pmnd.rs/zustand". This is to make sure only relevant data
        is scraped.
      </p>
    </FormModal>
  )
}

export default NewCollectionModal

interface Props {
  onClose: () => void
}
