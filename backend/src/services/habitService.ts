import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/errors.js'
import { checkAchievements, getActivityStreak, unlockProgressionRewards } from './progressionService.js'

const startOfDay = (date = new Date()) => {
  const value = new Date(date)
  value.setUTCHours(0, 0, 0, 0)
  return value
}

export async function listHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId, isActive: true },
    include: { completions: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function toggleHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId, isActive: true } })
  if (!habit) throw new AppError('Habit not found.', 404)
  const today = startOfDay()
  const existing = await prisma.habitCompletion.findFirst({
    where: { habitId, userId, completedAt: { gte: today, lt: new Date(today.getTime() + 86400000) } },
  })
  if (existing) return { alreadyCompleted: true, habit }

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } })
  const nextStreak = getActivityStreak(profile.lastActivityDate, profile.currentStreak)
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const completion = await tx.habitCompletion.create({
      data: { habitId, userId, xpEarned: habit.xpReward, goldEarned: habit.goldReward, completedAt: new Date() },
    })
    await tx.habit.update({
      where: { id: habitId },
      data: { currentStreak: { increment: 1 }, bestStreak: Math.max(habit.bestStreak, habit.currentStreak + 1) },
    })
    await tx.profile.update({
      where: { userId },
      data: {
        totalXp: { increment: habit.xpReward },
        gold: { increment: habit.goldReward },
        currentStreak: nextStreak,
        bestStreak: Math.max(profile.bestStreak, nextStreak),
        lastActivityDate: today,
        discipline: { increment: 1 },
      },
    })
    await tx.xpTransaction.create({ data: { userId, amount: habit.xpReward, source: 'HABIT', referenceId: completion.id } })
    await tx.goldTransaction.create({ data: { userId, amount: habit.goldReward, type: 'EARN', source: 'HABIT', referenceId: completion.id } })
    await checkAchievements(tx, userId)
    await unlockProgressionRewards(tx, userId, profile.level)
    return { alreadyCompleted: false, completion }
  })
}
