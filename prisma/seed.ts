import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma'

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123', 10)

  await prisma.user.create({
    data: {
      firstName: 'Björn',
      lastName: 'Rave',
      userName: 'bjoernrave',
      email: 'bjoern.rave@gmail.com',
      password: hashedPassword,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })

  .catch(async (e) => {
    console.error(e)

    await prisma.$disconnect()

    process.exit(1)
  })
