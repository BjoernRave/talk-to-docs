import React, { FC } from 'react'

const Input: FC<Props> = ({ label, ...props }) => {
  return (
    <div className='form-control w-full max-w-xs'>
      <label className='label'>
        <span className='label-text'>{label}</span>
      </label>
      <input
        type='text'
        className='input input-bordered w-full max-w-xs'
        {...props}
      />
    </div>
  )
}

export default Input

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}
