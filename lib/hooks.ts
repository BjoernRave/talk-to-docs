import { RefObject, useEffect, useRef, useState } from 'react'

interface Dimensions {
  width: number
  height: number
}

export function useDimensions(): [RefObject<HTMLDivElement>, Dimensions] {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  })
  const ref = useRef<HTMLDivElement>(null)

  const updateDimensions = () => {
    if (ref.current) {
      setDimensions({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      })
    }
  }

  useEffect(() => {
    updateDimensions() // Set initial dimensions

    // Ensure ref.current exists and the ResizeObserver API is supported
    if (ref.current && typeof ResizeObserver !== 'undefined') {
      const observeTarget = ref.current
      const resizeObserver = new ResizeObserver(updateDimensions)

      resizeObserver.observe(observeTarget)
      return () => {
        resizeObserver.unobserve(observeTarget)
      }
    }
  }, [ref])

  return [ref, dimensions]
}
