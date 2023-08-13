import React, { FC } from 'react'

const Input: FC<Props> = ({ label, ...props }) => {
  return (
    <div className='form-control w-full  my-2 '>
      <label className='label'>
        <span className='label-text'>{label}</span>
      </label>
      <input type='text' className='input input-bordered w-full ' {...props} />
    </div>
  )
}

export default Input

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}
