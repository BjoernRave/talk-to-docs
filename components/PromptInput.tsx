import { Button, TextField } from '@mui/material'
import { FC } from 'react'

const PromptInput: FC<Props> = ({ value, onChange, onSubmit }) => {
  return (
    <form className='mt-2 flex p-4 bg-slate-800 rounded-md' onSubmit={onSubmit}>
      <TextField
        id='chat-input'
        size='medium'
        className='w-full'
        placeholder='Enter your prompt here...'
        value={value}
        onChange={onChange}
      />
      <Button
        endIcon={
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
              d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
            />
          </svg>
        }
        className='!ml-4'>
        Send
      </Button>
    </form>
  )
}

export default PromptInput

interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}
