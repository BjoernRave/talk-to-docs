import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import '../globals.css'

function MyApp(props) {
  const [queryClient] = useState(() => new QueryClient())
  const { Component, pageProps } = props

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Toaster />
        <Component {...pageProps} />
      </Hydrate>
    </QueryClientProvider>
  )
}

export default MyApp
