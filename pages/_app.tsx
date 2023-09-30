import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import '../globals.css'

function MyApp(props) {
  const [queryClient] = useState(() => new QueryClient())
  const { Component, pageProps } = props

  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Toaster />
          <Component {...pageProps} />
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  )
}

export default MyApp
