import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'

const port = Number(process.env.PORT || 4000)
const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
const dummyAuth = process.env.DUMMY_AUTH !== 'false'
const dataFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'auth.json')

const seed = {
  player: { level: 12, xp: 2450, xpToNext: 3000, gold: 1840, streak: 12 },
  quests: [
    { id: 'q1', title: 'Study DSA', description: 'Complete 2 hours of DSA practice', category: 'study', difficulty: 'hard', xp: 150, gold: 60, completed: false },
    { id: 'q2', title: 'Morning Workout', description: "Complete today's workout session", category: 'fitness', difficulty: 'medium', xp: 100, gold: 40, completed: false },
    { id: 'q3', title: 'Read 20 Pages', description: 'Read 20 pages of your current book', category: 'reading', difficulty: 'easy', xp: 70, gold: 25, completed: false },
    { id: 'q4', title: 'Ship a Feature', description: 'Finish and deploy one product feature', category: 'work', difficulty: 'epic', xp: 220, gold: 90, completed: false },
    { id: 'q5', title: 'Meditate', description: '10 minutes of focused breathing', category: 'mindfulness', difficulty: 'easy', xp: 60, gold: 20, completed: true }
  ],
  habits: [
    { id: 'h1', name: 'Workout', streak: 12, accent: 'var(--violet)', week: [true, true, true, false, true, true, true] },
    { id: 'h2', name: 'Read', streak: 8, accent: 'var(--electric)', week: [true, true, false, true, true, true, false] },
    { id: 'h3', name: 'Coding', streak: 21, accent: 'var(--gold)', week: [true, true, true, true, true, true, true] },
    { id: 'h4', name: 'Meditation', streak: 5, accent: 'var(--success)', week: [false, true, true, false, true, true, false] }
  ],
  rewards: [
    { id: 'r1', name: 'Coffee Break', description: 'A well-earned cup of your favorite brew', goldCost: 100, active: true },
    { id: 'r2', name: 'Movie Night', description: 'Stream a film with zero guilt', goldCost: 300, active: true },
    { id: 'r3', name: 'Gaming Session', description: 'Two hours of pure play', goldCost: 500, active: true },
    { id: 'r4', name: 'Favorite Meal', description: 'Order the thing you actually crave', goldCost: 800, active: true },
    { id: 'r5', name: 'Cinematic Evening', description: 'Dinner and a night out on the town', goldCost: 1000, active: true },
    { id: 'r6', name: 'Rest Day', description: 'A full guilt-free day off, fully unlocked', goldCost: 1500, active: true }
  ],
  rewardPurchases: []
}

let auth = { users: {}, sessions: {} }

async function load() {
  try { auth = JSON.parse(await readFile(dataFile, 'utf8')) } catch { await save() }
  await ensureDemoAccount()
}

async function ensureDemoAccount() {
  if (!Object.values(auth.users).some((user) => user.email === 'demo@lifequest.local')) {
    const { salt, hash } = hashPassword('Demo1234!')
    const demo = { id: randomUUID(), email: 'demo@lifequest.local', name: 'Demo Warrior', salt, passwordHash: hash, state: structuredClone(seed) }
    auth.users[demo.id] = demo
    await save()
  }
}
async function save() {
  await mkdir(dirname(dataFile), { recursive: true })
  await writeFile(dataFile, JSON.stringify(auth, null, 2), 'utf8')
}
function json(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  })
  response.end(JSON.stringify(payload))
}
async function readBody(request) {
  let value = ''
  for await (const chunk of request) value += chunk
  return value ? JSON.parse(value) : {}
}
function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') }
}
function validPassword(password, user) {
  const actual = Buffer.from(hashPassword(password, user.salt).hash, 'hex')
  const expected = Buffer.from(user.passwordHash, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
function publicUser(user) { return { id: user.id, email: user.email, name: user.name } }
function sessionUser(request) {
  const token = (request.headers.authorization || '').replace(/^Bearer\s+/, '')
  const session = auth.sessions[token]
  if (!session || session.expiresAt < Date.now()) return null
  return auth.users[session.userId] || null
}
function tokenFor(user) {
  const token = randomBytes(32).toString('hex')
  auth.sessions[token] = { userId: user.id, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 }
  return token
}
function userState(user) {
  if (!user.state) user.state = structuredClone(seed)
  user.state.rewards ||= structuredClone(seed.rewards)
  user.state.rewardPurchases ||= []
  return user.state
}
function xpForLevel(level) {
  if (level === 12) return 3000
  if (level === 13) return 4000
  if (level === 14) return 5200
  return 1000 + (level + 1) * 250
}
function addRewards(state, quest) {
  let level = state.player.level
  let xp = state.player.xp + quest.xp
  let gold = state.player.gold + quest.gold
  const from = level
  while (xp >= state.player.xpToNext) { xp -= state.player.xpToNext; level += 1; gold += 250; state.player.xpToNext = xpForLevel(level) }
  state.player = { ...state.player, level, xp, gold }
  return level > from ? { from, to: level, goldBonus: (level - from) * 250 } : null
}

async function handle(request, response) {
  if (request.method === 'OPTIONS') return json(response, 204, {})
  const path = new URL(request.url, `http://${request.headers.host}`).pathname.replace(/\/$/, '')

  if (request.method === 'GET' && path === '/api/health') return json(response, 200, { ok: true, service: 'lifequest-api' })

  if (request.method === 'POST' && ['/api/auth/signup', '/api/auth/login'].includes(path)) {
    await ensureDemoAccount()
    const input = await readBody(request)
    const email = String(input.email || '').trim().toLowerCase()
    const password = String(input.password || '')
    const name = String(input.name || email.split('@')[0]).trim()
    if (dummyAuth && (!email || !password)) return json(response, 400, { error: 'Enter any email and password to continue' })
    if (!dummyAuth && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(response, 400, { error: 'Enter a valid email address' })
    if (!dummyAuth && password.length < 8) return json(response, 400, { error: 'Password must be at least 8 characters' })
    const existing = Object.values(auth.users).find((user) => user.email === email)
    if (path.endsWith('signup') && existing) return json(response, 409, { error: 'An account with that email already exists' })
    if (!dummyAuth && path.endsWith('login') && (!existing || !validPassword(password, existing))) return json(response, 401, { error: 'Incorrect email or password' })
    const user = existing || (() => {
      const { salt, hash } = hashPassword(password)
      const created = { id: randomUUID(), email, name: name || email.split('@')[0], salt, passwordHash: hash, state: structuredClone(seed) }
      auth.users[created.id] = created
      return created
    })()
    const token = tokenFor(user)
    await save()
    return json(response, path.endsWith('signup') ? 201 : 200, { token, user: publicUser(user), state: userState(user) })
  }

  if (request.method === 'POST' && path === '/api/auth/logout') {
    const token = (request.headers.authorization || '').replace(/^Bearer\s+/, '')
    delete auth.sessions[token]
    await save()
    return json(response, 200, { ok: true })
  }

  const user = sessionUser(request)
  if (!user) return json(response, 401, { error: 'Authentication required' })
  const state = userState(user)

  if (request.method === 'GET' && path === '/api/state') return json(response, 200, state)

  const complete = path.match(/^\/api\/quests\/([^/]+)\/complete$/)
  if (request.method === 'POST' && complete) {
    const quest = state.quests.find((item) => item.id === complete[1])
    if (!quest) return json(response, 404, { error: 'Quest not found' })
    let levelUp = null
    if (!quest.completed) { quest.completed = true; levelUp = addRewards(state, quest); await save() }
    return json(response, 200, { ...state, levelUp })
  }

  if (request.method === 'POST' && path === '/api/quests') {
    const input = await readBody(request)
    if (!String(input.title || '').trim() || !String(input.description || '').trim()) return json(response, 400, { error: 'Title and description are required' })
    state.quests.unshift({ id: `q-${Date.now()}`, title: String(input.title).trim(), description: String(input.description).trim(), category: String(input.category || 'work'), difficulty: String(input.difficulty || 'easy'), xp: Number(input.xp) || 50, gold: Number(input.gold) || 20, completed: false })
    await save()
    return json(response, 201, state)
  }

  const habit = path.match(/^\/api\/habits\/([^/]+)\/toggle$/)
  if (request.method === 'POST' && habit) {
    const item = state.habits.find((value) => value.id === habit[1])
    if (!item) return json(response, 404, { error: 'Habit not found' })
    const today = item.week.length - 1
    item.week[today] = !item.week[today]
    item.streak = item.week[today] ? item.streak + 1 : Math.max(0, item.streak - 1)
    await save()
    return json(response, 200, state)
  }

  if (request.method === 'POST' && path === '/api/rewards/redeem') {
    const input = await readBody(request)
    const reward = state.rewards.find((item) => item.id === String(input.rewardId) && item.active)
    if (!reward) return json(response, 404, { error: 'Reward not found' })

    const previousPurchase = state.rewardPurchases.find((item) => item.rewardId === reward.id)
    if (previousPurchase) return json(response, 200, { ...state, rewardPurchase: previousPurchase, alreadyRedeemed: true })

    const goldCost = Number(reward.goldCost)
    const currentGold = Number(state.player.gold)
    if (!Number.isFinite(goldCost) || goldCost < 0) return json(response, 500, { error: 'Reward price is invalid' })
    if (currentGold < goldCost) return json(response, 409, { error: `Not enough Gold. You need ${goldCost - currentGold} more Gold.` })

    const purchase = { id: `purchase-${Date.now()}-${randomBytes(4).toString('hex')}`, userId: user.id, rewardId: reward.id, goldSpent: goldCost, createdAt: new Date().toISOString() }
    state.player.gold = currentGold - goldCost
    state.rewardPurchases.push(purchase)
    await save()
    return json(response, 200, { ...state, rewardPurchase: purchase, alreadyRedeemed: false })
  }

  return json(response, 404, { error: 'Route not found' })
}

await load()
createServer((request, response) => handle(request, response).catch((error) => json(response, 500, { error: error.message }))).listen(port, () => console.log(`LifeQuest API running at http://localhost:${port}`))
