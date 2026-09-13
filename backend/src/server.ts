import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import authRoutes from './routes/authRoutes.js'
import questRoutes from './routes/questRoutes.js'
import rewardRoutes from './routes/rewardRoutes.js'
import { requireAuth as prismaRequireAuth } from './middleware/auth.js'
import { prisma } from './config/prisma.js'

const app = express()
const port = Number(process.env.PORT || 4000)
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000'

const users = new Map<string, any>()
const sessions = new Map<string, string>()
const stateSeed = {
  player: { level: 12, xp: 2450, xpToNext: 3000, gold: 1840, streak: 12 },
  quests: [
    { id: 'q1', title: 'Study DSA', description: 'Complete 2 hours of DSA practice', category: 'study', difficulty: 'hard', xp: 150, gold: 60, completed: false },
    { id: 'q2', title: 'Morning Workout', description: 'Complete today\'s workout session', category: 'fitness', difficulty: 'medium', xp: 100, gold: 40, completed: false },
    { id: 'q3', title: 'Read 20 Pages', description: 'Read 20 pages of your current book', category: 'reading', difficulty: 'easy', xp: 70, gold: 25, completed: false },
    { id: 'q4', title: 'Ship a Feature', description: 'Finish and deploy one product feature', category: 'work', difficulty: 'epic', xp: 220, gold: 90, completed: false },
    { id: 'q5', title: 'Meditate', description: '10 minutes of focused breathing', category: 'mindfulness', difficulty: 'easy', xp: 60, gold: 20, completed: true },
  ],
  habits: [
    { id: 'h1', name: 'Workout', streak: 12, accent: 'var(--violet)', week: [true, true, true, false, true, true, true] },
    { id: 'h2', name: 'Read', streak: 8, accent: 'var(--electric)', week: [true, true, false, true, true, true, false] },
    { id: 'h3', name: 'Coding', streak: 21, accent: 'var(--gold)', week: [true, true, true, true, true, true, true] },
    { id: 'h4', name: 'Meditation', streak: 5, accent: 'var(--success)', week: [false, true, true, false, true, true, false] },
  ],
  rewards: [
    { id: 'r1', name: 'Coffee Break', description: 'A well-earned cup of your favorite brew', icon: 'Coffee', cost: 100 },
    { id: 'r2', name: 'Movie Night', description: 'Stream a film with zero guilt', icon: 'Film', cost: 300 },
    { id: 'r3', name: 'Gaming Session', description: 'Two hours of pure play', icon: 'Gamepad2', cost: 500 },
    { id: 'r4', name: 'Favorite Meal', description: 'Order the thing you actually crave', icon: 'Pizza', cost: 800 },
    { id: 'r5', name: 'Cinematic Evening', description: 'Dinner and a night out on the town', icon: 'Sparkles', cost: 1000 },
    { id: 'r6', name: 'Rest Day', description: 'A full guilt-free day off, fully unlocked', icon: 'Umbrella', cost: 4500 },
  ],
}

const userState = (user: any) => {
  if (!user.state) {
    user.state = structuredClone(stateSeed)
  }
  return user.state
}

const publicUser = (user: any) => ({ id: user.id, email: user.email, name: user.name })

const ensureDemoUser = async () => {
  if (!users.has('demo')) {
    const passwordHash = await bcrypt.hash('TestPassword123', 10)
    users.set('demo', {
      id: 'demo',
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash,
      state: structuredClone(stateSeed),
    })
  }
}

app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/quests', questRoutes)
app.use('/api/rewards', rewardRoutes)

app.get('/api/state', prismaRequireAuth, async (req, res) => {
  try {
    const [profile, quests] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: req.user!.id } }),
      prisma.quest.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } }),
    ])
    if (!profile) return res.status(404).json({ message: 'Profile not found.' })
    return res.json({
      player: { level: profile.level, xp: profile.totalXp, xpToNext: profile.totalXp, gold: profile.gold },
      quests: quests.map((quest: any) => ({
        id: quest.id,
        title: quest.title,
        description: quest.description,
        category: quest.category.toLowerCase(),
        difficulty: quest.difficulty.toLowerCase(),
        xp: quest.xpReward,
        gold: quest.goldReward,
        completed: quest.isCompleted,
      })),
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lifequest-api' })
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body ?? {}
  const trimmedEmail = String(email ?? '').trim().toLowerCase()
  const trimmedName = String(name ?? '').trim()

  if (!trimmedName || trimmedName.length < 2) {
    return res.status(400).json({ message: 'Enter your name.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address.' })
  }
  if (String(password ?? '').length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' })
  }

  if ([...users.values()].some((user) => user.email === trimmedEmail)) {
    return res.status(409).json({ message: 'An account with that email already exists.' })
  }

  const passwordHash = await bcrypt.hash(String(password), 10)
  const user = { id: randomUUID(), email: trimmedEmail, name: trimmedName, passwordHash, state: structuredClone(stateSeed) }
  users.set(user.id, user)
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '30d' })
  sessions.set(token, user.id)

  return res.status(201).json({ token, user: publicUser(user), state: userState(user) })
})

app.post('/api/auth/signup', async (req, res) => {
  return app._router.handle(req, res)
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  const trimmedEmail = String(email ?? '').trim().toLowerCase()
  const user = [...users.values()].find((item) => item.email === trimmedEmail)

  if (!user) {
    return res.status(401).json({ message: 'Incorrect email or password.' })
  }

  const valid = await bcrypt.compare(String(password ?? ''), user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Incorrect email or password.' })
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '30d' })
  sessions.set(token, user.id)
  return res.json({ token, user: publicUser(user), state: userState(user) })
})

app.post('/api/auth/logout', (req, res) => {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token) sessions.delete(token)
  return res.json({ ok: true })
})

const requireAuth = (req: any, res: any, next: any) => {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Please log in again.' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-secret') as { userId: string }
    const user = users.get(payload.userId)
    if (!user || sessions.get(token) !== user.id) return res.status(401).json({ message: 'Please log in again.' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ message: 'Please log in again.' })
  }
}

app.get('/api/auth/me', requireAuth, (req, res) => { res.json({ user: publicUser(req.user) }) })
app.get('/api/state', requireAuth, (req, res) => { res.json(userState(req.user)) })

const xpForLevel = (level: number) => {
  const thresholds = [0, 500, 1200, 2000, 3000, 4200, 5600, 7200, 9000, 11000, 13000, 15500, 18500, 22000, 26000]
  return thresholds[Math.min(level, thresholds.length - 1)]
}

const applyProgress = (state: any, quest: any) => {
  const player = state.player
  const from = player.level
  let xp = player.xp + quest.xp
  let gold = player.gold + quest.gold
  let level = player.level
  const nextThreshold = xpForLevel(level)
  while (xp >= nextThreshold) {
    xp -= nextThreshold
    level += 1
  }
  player.level = level
  player.xp = xp
  player.gold = gold
  player.xpToNext = xpForLevel(level)
  return level > from ? { from, to: level, goldBonus: (level - from) * 250 } : null
}

app.get('/api/quests', requireAuth, (req, res) => {
  res.json(userState(req.user).quests)
})

app.post('/api/quests', requireAuth, (req, res) => {
  const state = userState(req.user)
  const body = req.body ?? {}
  const title = String(body.title ?? '').trim()
  const description = String(body.description ?? '').trim()
  if (!title || !description) return res.status(400).json({ message: 'Title and description are required.' })
  const quest = {
    id: `q-${Date.now()}`,
    title,
    description,
    category: String(body.category ?? 'work'),
    difficulty: String(body.difficulty ?? 'easy'),
    xp: Number(body.xp) || 50,
    gold: Number(body.gold) || 20,
    completed: false,
  }
  state.quests.unshift(quest)
  res.status(201).json(state)
})

app.post('/api/quests/:id/complete', requireAuth, (req, res) => {
  const state = userState(req.user)
  const quest = state.quests.find((item: any) => item.id === req.params.id)
  if (!quest) return res.status(404).json({ message: 'Quest not found.' })
  if (quest.completed) return res.status(409).json({ message: 'Quest already completed.' })
  quest.completed = true
  const levelUp = applyProgress(state, quest)
  res.json({ ...state, levelUp })
})

app.post('/api/habits/:id/toggle', requireAuth, (req, res) => {
  const state = userState(req.user)
  const habit = state.habits.find((item: any) => item.id === req.params.id)
  if (!habit) return res.status(404).json({ message: 'Habit not found.' })
  const last = habit.week.length - 1
  habit.week[last] = !habit.week[last]
  habit.streak = habit.week[last] ? habit.streak + 1 : Math.max(0, habit.streak - 1)
  res.json(state)
})

app.get('/api/rewards', requireAuth, (req, res) => {
  const state = userState(req.user)
  res.json(state.rewards)
})

app.post('/api/rewards/:rewardId/redeem', requireAuth, (req, res) => {
  const state = userState(req.user)
  const reward = state.rewards.find((item: any) => item.id === req.params.rewardId)
  if (!reward) return res.status(404).json({ message: 'Reward not found.' })
  const currentGold = state.player.gold
  if (currentGold < reward.cost) {
    return res.status(400).json({ message: 'Not enough Gold', required: reward.cost, available: currentGold })
  }
  state.player.gold = currentGold - reward.cost
  res.json({ ...state, rewardPurchase: { id: `purchase-${Date.now()}`, rewardId: reward.id, goldSpent: reward.cost } })
})

app.get('/api/dashboard', requireAuth, (_req, res) => {
  const user = _req.user
  const state = userState(user)
  res.json({
    user: publicUser(user),
    profile: { level: state.player.level, totalXp: state.player.xp, gold: state.player.gold, currentStreak: state.player.streak },
    level: state.player.level,
    totalXp: state.player.xp,
    currentXp: state.player.xp,
    xpForNextLevel: state.player.xpToNext,
    xpProgress: 100,
    gold: state.player.gold,
    currentStreak: state.player.streak,
    todayQuests: state.quests.filter((q: any) => !q.completed),
    completedToday: state.quests.filter((q: any) => q.completed).length,
    dailyGoal: 5,
    recentAchievements: [],
    nextLifeCard: null,
    recentTransactions: [],
    habitsSummary: state.habits,
  })
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.statusCode || 500
  const message = err.message || 'Something went wrong. Please try again.'
  res.status(status).json({ message })
})

app.listen(port, async () => {
  await ensureDemoUser()
  console.log(`LifeQuest backend running at http://localhost:${port}`)
})
