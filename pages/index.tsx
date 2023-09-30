import Button from '@/components/Button'
import Input from '@/components/Input'

import { getServerAuthSession } from '@/lib/serverUtils'
import { GetServerSideProps, NextPage } from 'next'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const Home: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { query, replace } = useRouter()

  useEffect(() => {
    if (query.error) {
      toast.error('Login fehlgeschlagen')
      replace('/')
    }
  }, [])

  const [isLoading, setIsLoading] = useState(false)
  const handleLogin = async ({
    email,
    password,
  }: {
    email?: string
    password: string
  }) => {
    setIsLoading(true)
    await signIn('credentials', {
      email,
      password,

      callbackUrl: '/',
    })
    setIsLoading(false)
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-200 p-4 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='flex w-full max-w-md flex-col items-center space-y-8'>
        {isLoading ? (
          <span className='loading loading-infinity loading-md'></span>
        ) : (
          <>
            <h2 className='mt-6 text-center text-3xl font-extrabold '>
              Sign in
            </h2>

            <form
              className='flex flex-col items-center'
              onSubmit={(e) => {
                e.preventDefault()
                handleLogin({ email, password })
              }}>
              <Input
                value={email}
                label='Email'
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type='password'
                value={password}
                label={'Password'}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className='mt-4' isLoading={isLoading}>
                Anmelden
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context)

  if (!session?.user) {
    return {
      props: {},
    }
  }

  return {
    redirect: {
      destination: '/chat',
      permanent: false,
    },
    props: {},
  }
}
