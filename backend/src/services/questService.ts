import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/errors.js'
import { getLevelFromXp } from '../utils/level.js'
import type { Prisma } from '@prisma/client'

const CATEGORY_MAP = {
  study: 'STUDY',
  fitness: 'FITNESS',
  reading: 'CUSTOM',
  work: 'WORK',
  mindfulness: 'PERSONAL_GROWTH',
  creative: 'CREATIVE',
} as const

const DIFFICULTY_MAP = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
  epic: 'EPIC',
} as const

export async function listQuests(userId: string) {
  return prisma.quest.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }],
  })
}

export async function createQuest(userId: string, input: { title: string; description: string; category: string; difficulty: string; xp: number; gold: number }) {
  const title = input.title.trim()
  const description = input.description.trim()

  if (!title || !description) throw new AppError('Title and description are required.', 400)

  const category = CATEGORY_MAP[(input.category as keyof typeof CATEGORY_MAP) ?? 'work'] ?? 'CUSTOM'
  const difficulty = DIFFICULTY_MAP[(input.difficulty as keyof typeof DIFFICULTY_MAP) ?? 'easy'] ?? 'EASY'
  const xpReward = Number(input.xp) || 50
  const goldReward = Number(input.gold) || 20

  return prisma.quest.create({
    data: {
      userId,
      title,
      description,
      category,
      difficulty,
      xpReward,
      goldReward,
      estimatedMinutes: 30,
      repeatType: 'ONCE',
      isCompleted: false,
    },
  })
}

export async function getQuest(userId: string, questId: string) {
  const quest = await prisma.quest.findFirst({ where: { id: questId, userId } })
  if (!quest) throw new AppError('Quest not found.', 404)
  return quest
}

export async function updateQuest(userId: string, questId: string, input: Partial<{ title: string; description: string; category: string; difficulty: string; xpReward: number; goldReward: number }>) {
  const quest = await getQuest(userId, questId)
  if (quest.isCompleted) throw new AppError('Completed quests cannot be edited.', 400)

  return prisma.quest.update({
    where: { id: questId },
    data: {
      title: input.title?.trim() || quest.title,
      description: input.description?.trim() || quest.description,
      category: CATEGORY_MAP[(input.category as keyof typeof CATEGORY_MAP) ?? 'work'] ?? quest.category,
      difficulty: DIFFICULTY_MAP[(input.difficulty as keyof typeof DIFFICULTY_MAP) ?? 'easy'] ?? quest.difficulty,
      xpReward: Number(input.xpReward) || quest.xpReward,
      goldReward: Number(input.goldReward) || quest.goldReward,
    },
  })
}

export async function deleteQuest(userId: string, questId: string) {
  await getQuest(userId, questId)
  await prisma.quest.delete({ where: { id: questId } })
}

export async function completeQuest(userId: string, questId: string) {
  const quest = await prisma.quest.findFirst({ where: { id: questId, userId } })
  if (!quest) throw new AppError('Quest not found.', 404)
  if (quest.isCompleted) {
    throw new AppError('Quest already completed.', 409)
  }

  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile) throw new AppError('Profile not found.', 404)

  const previousLevel = profile.level
  const nextLevel = getLevelFromXp(profile.totalXp + quest.xpReward)

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const completion = await tx.questCompletion.create({
      data: {
        questId: quest.id,
        userId,
        xpEarned: quest.xpReward,
        goldEarned: quest.goldReward,
      },
    })

    await tx.profile.update({
      where: { userId },
      data: {
        totalXp: { increment: quest.xpReward },
        gold: { increment: quest.goldReward },
        level: nextLevel,
      },
    })

    await tx.quest.update({ where: { id: quest.id }, data: { isCompleted: true } })

    await tx.xpTransaction.create({
      data: {
        userId,
        amount: quest.xpReward,
        source: 'QUEST',
        referenceId: completion.id,
      },
    })

    await tx.goldTransaction.create({
      data: {
        userId,
        amount: quest.goldReward,
        type: 'EARN',
        source: 'QUEST',
        referenceId: completion.id,
      },
    })

    return { completion, levelUp: nextLevel > previousLevel ? { from: previousLevel, to: nextLevel, goldBonus: 0 } : null }
  })

  return result
}
