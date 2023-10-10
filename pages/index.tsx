import { getServerAuthSession } from '@/lib/serverUtils'
import { Button } from '@mui/material'
import { GetServerSideProps, NextPage } from 'next'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { EmailInput, Form, Loader, PasswordInput } from 'rave-ui'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import z from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const Home: NextPage = () => {
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
    <div className='flex min-h-screen items-center justify-center bg-slate-800 p-4 text-sm leading-6 text-slate-900  sm:text-base sm:leading-7 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='flex w-full max-w-md flex-col items-center space-y-8'>
        {isLoading ? (
          <span className='loading loading-infinity loading-md'></span>
        ) : (
          <>
            <h2 className='mt-6 text-center text-3xl text-white font-extrabold '>
              Sign in
            </h2>

            <Form
              validationSchema={LoginSchema}
              initialValues={{
                email: '',
                password: '',
              }}
              className='flex flex-col items-center'
              onSubmit={handleLogin}>
              <EmailInput name='email' label='Email' />
              <PasswordInput label={'Password'} name='password' />
              <Button type='submit' className='mt-4'>
                {isLoading ? <Loader /> : 'Anmelden'}
              </Button>
            </Form>
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
