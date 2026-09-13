import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/errors.js'
import type { Prisma } from '@prisma/client'

export async function listRewards() {
  return prisma.reward.findMany({ where: { isActive: true }, orderBy: { goldCost: 'asc' } })
}

export async function redeemReward(userId: string, rewardId: string) {
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
  if (!reward) throw new AppError('Reward not found.', 404)
  if (!reward.isActive) throw new AppError('Reward is not available.', 400)

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.rewardPurchase.findFirst({ where: { userId, rewardId } })
    if (existing) {
      const profile = await tx.profile.findUnique({ where: { userId } })
      return {
        success: true,
        message: 'Reward redeemed successfully',
        alreadyRedeemed: true,
        goldSpent: 0,
        remainingGold: profile?.gold ?? 0,
        purchase: existing,
      }
    }

    const updated = await tx.profile.updateMany({
      where: { userId, gold: { gte: reward.goldCost } },
      data: { gold: { decrement: reward.goldCost } },
    })
    if (updated.count === 0) {
      const profile = await tx.profile.findUnique({ where: { userId }, select: { gold: true } })
      if (!profile) throw new AppError('Profile not found.', 404)
      throw new AppError('Not enough Gold', 400, { required: reward.goldCost, available: profile.gold })
    }

    const existingAfterDebit = await tx.rewardPurchase.findFirst({ where: { userId, rewardId } })
    if (existingAfterDebit) {
      const profile = await tx.profile.update({
        where: { userId },
        data: { gold: { increment: reward.goldCost } },
      })
      return {
        success: true,
        message: 'Reward redeemed successfully',
        alreadyRedeemed: true,
        goldSpent: 0,
        remainingGold: profile.gold,
        purchase: existingAfterDebit,
      }
    }

    const updatedProfile = await tx.profile.findUniqueOrThrow({ where: { userId } })

    const purchase = await tx.rewardPurchase.create({
      data: {
        userId,
        rewardId,
        goldSpent: reward.goldCost,
      },
    })

    await tx.goldTransaction.create({
      data: {
        userId,
        amount: reward.goldCost,
        type: 'SPEND',
        source: 'REWARD',
        referenceId: purchase.id,
      },
    })

    return {
      success: true,
      message: 'Reward redeemed successfully',
      alreadyRedeemed: false,
      goldSpent: reward.goldCost,
      remainingGold: updatedProfile.gold,
      purchase,
    }
  })
}
