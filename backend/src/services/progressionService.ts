import { prisma } from '../config/prisma.js'
import { getLevelSummary } from '../utils/level.js'

const referenceRewards = [
  ['Coffee Break', 'A well-earned cup of your favorite brew', 100],
  ['Movie Night', 'Stream a film with zero guilt', 300],
  ['Gaming Session', 'Two hours of pure play', 500],
  ['Favorite Meal', 'Order the thing you actually crave', 800],
  ['Cinematic Evening', 'Dinner and a night out on the town', 1000],
  ['Rest Day', 'A full guilt-free day off, fully unlocked', 4500],
] as const

const referenceAchievements = [
  ['First Quest', 'Complete your first quest', 'FIRST_QUEST', 1],
  ['Unstoppable', 'Reach a 7 day streak', 'STREAK', 7],
  ['Quest Master', 'Complete 100 quests', 'QUESTS_COMPLETED', 100],
  ['Scholar', 'Complete 50 study quests', 'STUDY_QUESTS', 50],
  ['Gold Hoarder', 'Earn 10,000 Gold', 'GOLD_EARNED', 10000],
  ['Level 10', 'Reach level 10', 'LEVEL', 10],
] as const

const referenceLifeCards = [
  [13, 'Legend', 'Consistency turns effort into identity.'],
  [14, 'Elite', 'Discipline becomes second nature.'],
  [15, 'Master', 'Small actions. Extraordinary results.'],
] as const

export async function ensureReferenceData() {
  for (const [name, description, goldCost] of referenceRewards) {
    const existing = await prisma.reward.findFirst({ where: { name } })
    if (!existing) await prisma.reward.create({ data: { name, description, goldCost } })
  }
  for (const [name, description, requirementType, requirementValue] of referenceAchievements) {
    const existing = await prisma.achievement.findFirst({ where: { name } })
    if (!existing) {
      await prisma.achievement.create({
        data: { name, description, icon: name, requirementType, requirementValue },
      })
    }
  }
  for (const [levelRequired, name, description] of referenceLifeCards) {
    const existing = await prisma.lifeCard.findFirst({ where: { levelRequired } })
    if (!existing) await prisma.lifeCard.create({ data: { levelRequired, name, description } })
  }
}

const startOfDay = (date: Date) => {
  const value = new Date(date)
  value.setUTCHours(0, 0, 0, 0)
  return value
}

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000)

export function getActivityStreak(lastActivityDate: Date | null, currentStreak: number, now = new Date()) {
  const today = startOfDay(now)
  if (!lastActivityDate) return 1
  const last = startOfDay(lastActivityDate)
  const difference = Math.round((today.getTime() - last.getTime()) / 86400000)
  if (difference === 0) return currentStreak
  return difference === 1 ? currentStreak + 1 : 1
}

export async function unlockProgressionRewards(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], userId: string, level: number) {
  const cards = await tx.lifeCard.findMany({ where: { levelRequired: { lte: level } } })
  for (const card of cards) {
    await tx.userLifeCard.upsert({
      where: { userId_lifeCardId: { userId, lifeCardId: card.id } },
      create: { userId, lifeCardId: card.id },
      update: {},
    })
  }
}

export async function checkAchievements(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], userId: string) {
  const [profile, questCount, studyCount, earned] = await Promise.all([
    tx.profile.findUniqueOrThrow({ where: { userId } }),
    tx.questCompletion.count({ where: { userId } }),
    tx.questCompletion.count({ where: { userId, quest: { category: 'STUDY' } } }),
    tx.goldTransaction.aggregate({ where: { userId, type: 'EARN' }, _sum: { amount: true } }),
  ])
  const values: Record<string, number> = {
    FIRST_QUEST: questCount,
    STREAK: profile.bestStreak,
    QUESTS_COMPLETED: questCount,
    STUDY_QUESTS: studyCount,
    GOLD_EARNED: earned._sum.amount ?? 0,
    LEVEL: profile.level,
  }
  const achievements = await tx.achievement.findMany()
  for (const achievement of achievements) {
    if ((values[achievement.requirementType] ?? 0) >= achievement.requirementValue) {
      await tx.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
        create: { userId, achievementId: achievement.id },
        update: {},
      })
    }
  }
}

export async function getUserState(userId: string) {
  await ensureReferenceData()
  const [profile, quests, habits, achievements, unlockedAchievements, cards, unlockedCards] = await Promise.all([
    prisma.profile.findUniqueOrThrow({ where: { userId } }),
    prisma.quest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.habit.findMany({ where: { userId, isActive: true }, include: { completions: true }, orderBy: { createdAt: 'asc' } }),
    prisma.achievement.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.userAchievement.findMany({ where: { userId } }),
    prisma.lifeCard.findMany({ orderBy: { levelRequired: 'asc' } }),
    prisma.userLifeCard.findMany({ where: { userId } }),
  ])
  const summary = getLevelSummary(profile.totalXp)
  const lastActivity = profile.lastActivityDate ? startOfDay(profile.lastActivityDate) : null
  const today = startOfDay(new Date())
  const daysSinceActivity = lastActivity ? Math.round((today.getTime() - lastActivity.getTime()) / 86400000) : null
  const effectiveStreak = daysSinceActivity !== null && daysSinceActivity > 1 ? 0 : profile.currentStreak
  const weekStart = addDays(today, -6)
  return {
    player: {
      level: summary.level,
      xp: summary.currentLevelXp,
      xpToNext: summary.xpForNextLevel,
      totalXp: profile.totalXp,
      gold: profile.gold,
      streak: effectiveStreak,
      bestStreak: profile.bestStreak,
    },
    quests: quests.map((quest) => ({
      id: quest.id, title: quest.title, description: quest.description,
      category: quest.category.toLowerCase(), difficulty: quest.difficulty.toLowerCase(),
      xp: quest.xpReward, gold: quest.goldReward, completed: quest.isCompleted,
    })),
    habits: habits.map((habit) => ({
      id: habit.id, name: habit.name, streak: habit.currentStreak,
      category: habit.category.toLowerCase(),
      week: Array.from({ length: 7 }, (_, index) => {
        const day = addDays(weekStart, index)
        return habit.completions.some((completion) => startOfDay(completion.completedAt).getTime() === day.getTime())
      }),
    })),
    stats: [
      { name: 'Strength', value: profile.strength },
      { name: 'Intelligence', value: profile.intelligence },
      { name: 'Focus', value: profile.focus },
      { name: 'Discipline', value: profile.discipline },
    ],
    achievements: achievements.map((achievement) => {
      const value = achievement.requirementType === 'LEVEL' ? profile.level : achievement.requirementType === 'STREAK' ? profile.bestStreak : 0
      return {
        id: achievement.id, title: achievement.name, description: achievement.description,
        unlocked: unlockedAchievements.some((item) => item.achievementId === achievement.id),
        progress: value, goal: achievement.requirementValue,
      }
    }),
    lifeCards: cards.map((card) => ({ ...card, unlocked: unlockedCards.some((item) => item.lifeCardId === card.id) })),
  }
}