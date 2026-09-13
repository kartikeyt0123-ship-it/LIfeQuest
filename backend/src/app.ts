import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import questRoutes from './routes/questRoutes.js'
import rewardRoutes from './routes/rewardRoutes.js'
import habitRoutes from './routes/habitRoutes.js'
import { requireAuth, revokeToken } from './middleware/auth.js'
import { getUserState } from './services/progressionService.js'

const app = express()
const port = Number(process.env.PORT || 4000)
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000'

// Accept the configured frontend origin plus any localhost/127.0.0.1 port, so the
// Next dev server still works when it falls back to 3001 because 3000 is busy.
const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === frontendOrigin || localOrigin.test(origin)) return callback(null, true)
      return callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'lifequest-api' }))
app.use('/api/auth', authRoutes)
app.use('/api/quests', questRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/rewards', rewardRoutes)

app.get('/api/state', requireAuth, async (req, res) => {
  try {
    return res.json(await getUserState(req.user!.id))
  } catch {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
})

app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const state = await getUserState(req.user!.id)
    return res.json({
      user: { id: req.user!.id, name: req.user!.name, email: req.user!.email },
      ...state,
      todayQuests: state.quests.filter((quest) => !quest.completed),
      completedToday: state.quests.filter((quest) => quest.completed).length,
      nextLifeCard: state.lifeCards.find((card) => !card.unlocked) ?? null,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
})
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : ''
  if (token) revokeToken(token)
  return res.json({ ok: true })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  return res.status(500).json({ message: 'Something went wrong. Please try again.' })
})

export default app
