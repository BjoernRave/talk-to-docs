import { theme } from '@/lib/theme'
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { AppWrapper } from 'rave-ui'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import '../globals.css'

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
  emotionCache,
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider session={pageProps.session}>
      <AppWrapper locale='en' theme={theme} emotionCache={emotionCache}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <Toaster />
            <Component {...pageProps} />
          </Hydrate>
        </QueryClientProvider>
      </AppWrapper>
    </SessionProvider>
  )
}

export default MyApp
