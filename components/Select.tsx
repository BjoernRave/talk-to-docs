import { Option } from '@/lib/types'
import React, { FC } from 'react'

const Select: FC<Props> = ({ options, label, ...props }) => {
  return (
    <div className={`form-control w-full  my-2  ${props?.className}`}>
      <label className='label pt-0'>
        <span className='label-text'>{label}</span>
      </label>
      <select
        {...props}
        className={`select select-bordered w-full max-w-xs ${props?.className}`}>
        {options?.map((c) => (
          <option key={String(c.value)} value={String(c.value)}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
  label: string
}
