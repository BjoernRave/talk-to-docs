import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/serverUtils'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession({ req, res })

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId: (session.user as any).id,
    },
    include: {
      messages: true,
    },
  })

  res.status(200).json(chats)
}
