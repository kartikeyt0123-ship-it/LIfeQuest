import app from './app.js'
import { prisma } from './config/prisma.js'

const port = Number(process.env.PORT || 4000)

app.listen(port, () => {
  console.log(`LifeQuest backend running at http://localhost:${port}`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
