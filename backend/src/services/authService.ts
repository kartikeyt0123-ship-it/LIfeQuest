import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/errors.js'
import { ensureReferenceData } from './progressionService.js'

export async function registerUser(name: string, email: string, password: string) {
  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedName || trimmedName.length < 2) {
    throw new AppError('Please enter your name.', 400)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new AppError('Enter a valid email address.', 400)
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400)
  }

  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } })
  if (existing) {
    throw new AppError('An account with that email already exists.', 409)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      profile: {
        create: {
          level: 1,
          totalXp: 0,
          gold: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      },
    },
    include: {
      profile: true,
    },
  })

  await prisma.habit.createMany({
    data: [
      ['Workout', 'FITNESS', 40, 12],
      ['Read', 'STUDY', 30, 8],
      ['Coding', 'CODING', 35, 21],
      ['Meditation', 'DISCIPLINE', 25, 5],
    ].map(([habitName, category, goldReward, currentStreak]) => ({
      userId: user.id,
      name: habitName as string,
      category: category as 'FITNESS',
      xpReward: 50,
      goldReward: goldReward as number,
      currentStreak: currentStreak as number,
      bestStreak: currentStreak as number,
    })),
  })
  await ensureReferenceData()

  return buildAuthPayload(user)
}

export async function loginUser(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: trimmedEmail }, include: { profile: true } })

  if (!user) {
    throw new AppError('Incorrect email or password.', 401)
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    throw new AppError('Incorrect email or password.', 401)
  }

  return buildAuthPayload(user)
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
    },
  })

  if (!user) {
    throw new AppError('Please log in again.', 401)
  }

  return user
}

function buildAuthPayload(user: { id: string; name: string; email: string; profile?: { level: number; totalXp: number; gold: number; currentStreak: number; bestStreak: number } | null }) {
  const secret = process.env.JWT_SECRET ?? 'development-secret'
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '30d' })
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
    profile: user.profile ?? null,
  }
}
