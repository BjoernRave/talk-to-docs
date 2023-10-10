import { theme as twTheme } from '@/tailwind.config'
import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import { useWindowSize } from 'react-use'
import Loader from './Loader'

const Button: FC<Props> = ({
  variant = 'primary',
  isLoading,
  endIcon,
  startIcon,
  children,
  type,
  color = 'primary',
  hideLabelOnMobile,
  size = 'medium',
  border,
  ...props
}) => {
  const { width } = useWindowSize()
  const isDisabled = props?.disabled || isLoading

  const hideLabel = hideLabelOnMobile && width < 1024

  if (variant === 'primary') {
    return (
      <button
        {...props}
        type={type ?? 'button'}
        disabled={isDisabled}
        className={`flex items-center rounded-lg justify-center whitespace-nowrap ${
          size === 'small'
            ? 'py-1 lg:py-2 px-2 lg:px-3'
            : size === 'large'
            ? 'py-5 text-xl px-6'
            : 'py-2 lg:py-3 text-xl px-3 lg:px-4'
        } font-bold ${
          color === 'primary'
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : color === 'secondary'
            ? 'bg-secondary-500 text-white  hover:bg-secondary-700'
            : 'bg-warning text-white'
        } border-none   ${
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }  ${props.className ?? ''}`}>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {startIcon && (
              <div
                className={`flex items-center justify-center ${
                  !hideLabel && children ? 'mr-4' : 'scale-125'
                }`}>
                {startIcon}
              </div>
            )}
            {hideLabel ? null : children}
            {endIcon && (
              <div
                className={`flex items-center justify-center ${
                  !hideLabel! && children ? 'ml-4' : 'scale-125'
                }`}>
                {endIcon}
              </div>
            )}
          </>
        )}
      </button>
    )
  }

  return (
    <button
      {...props}
      type={type ?? 'button'}
      disabled={isDisabled}
      style={
        border
          ? {
              border: `2px solid ${
                color === 'black'
                  ? '#000'
                  : color === 'primary'
                  ? twTheme.colors['primary-500']
                  : twTheme.colors['secondary-500']
              }`,
            }
          : null
      }
      className={`flex items-center rounded-lg justify-center whitespace-nowrap ${
        size === 'small'
          ? 'py-1 lg:py-2 px-2 lg:px-3'
          : size === 'large'
          ? 'py-5 text-xl px-6'
          : 'py-2 lg:py-3 text-xl px-3 lg:px-4'
      } font-bold ${
        color === 'primary'
          ? 'text-primary-500'
          : color === 'secondary'
          ? 'text-secondary-500 '
          : color === 'black'
          ? 'text-black'
          : 'text-warning'
      } bg-transparent border-none hover:bg-gray-300  ${
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }  ${props.className ?? ''}`}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {startIcon && (
            <div
              className={`flex items-center justify-center ${
                !hideLabel && children ? 'mr-4' : 'scale-125'
              }`}>
              {startIcon}
            </div>
          )}
          {hideLabel ? null : children}
          {endIcon && (
            <div
              className={`flex items-center justify-center ${
                !hideLabel && children ? 'ml-4' : 'scale-125'
              }`}>
              {endIcon}
            </div>
          )}
        </>
      )}
    </button>
  )
}

export default Button

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  endIcon?: ReactNode
  startIcon?: ReactNode
  isLoading?: boolean
  variant?: 'primary' | 'secondary'
  color?: 'primary' | 'secondary' | 'warning' | 'black'
  hideLabelOnMobile?: boolean
  size?: 'small' | 'medium' | 'large'
  border?: boolean
}
