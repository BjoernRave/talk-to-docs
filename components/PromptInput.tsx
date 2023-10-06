import { FC } from 'react'

const PromptInput: FC<Props> = ({ value, onChange, onSubmit }) => {
  return (
    <form className='mt-2' onSubmit={onSubmit}>
      <label htmlFor='chat-input' className='sr-only'>
        Enter your prompt
      </label>
      <div className='relative'>
        <input
          autoFocus
          value={value}
          onChange={onChange}
          id='chat-input'
          className='block w-full resize-none rounded-xl border-none bg-slate-200 p-4  pr-20 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:ring-blue-500 sm:text-base'
          placeholder='Enter your prompt'
          required></input>
        <button
          type='submit'
          className='absolute bottom-2 right-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:text-base'>
          Send <span className='sr-only'>Send message</span>
        </button>
      </div>
    </form>
  )
}

export default PromptInput

interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}
