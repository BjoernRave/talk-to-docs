import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Prisma adapter for NextAuth, optional and can be removed
import { prisma } from '@/lib/prisma'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }: any) {
      if (session.user && token.id) {
        session.user.id = Number(token.id as any)
      }

      return session
    },
    jwt(stuff) {
      if (stuff.token && stuff.user) {
        stuff.token.id = Number((stuff.user as any).id)
      }
      return stuff.token
    },
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    async encode(stuff) {
      return jwt.sign(stuff.token, process.env.NEXTAUTH_SECRET!)
    },
    async decode(stuff) {
      return jwt.verify(stuff.token!, process.env.NEXTAUTH_SECRET!) as any
    },
  },

  pages: {
    signIn: '/',
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        const result = await bcrypt.compare(credentials.password, user.password)

        console.log('result', result)

        if (!result) {
          return null
        }

        return {
          id: String(user.id),
          name: user.userName,
          email: user.email,
        }
      },
    }),
  ],
}

export default NextAuth(authOptions)
