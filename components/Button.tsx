import React, { FC } from 'react'

const Button: FC<Props> = ({ children, isLoading, ...props }) => {
  return (
    <button
      {...props}
      style={{
        ...props?.style,
      }}
      className={`btn btn-primary ${props?.className}`}>
      {isLoading ? (
        <span className='loading loading-infinity loading-md'></span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}
