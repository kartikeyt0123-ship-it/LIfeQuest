import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/errors.js'

export async function listRewards() {
  return prisma.reward.findMany({ where: { isActive: true }, orderBy: { goldCost: 'asc' } })
}

export async function redeemReward(userId: string, rewardId: string) {
  const reward = await prisma.reward.findFirst({ where: { id: rewardId, isActive: true } })
  if (!reward) throw new AppError('Reward not found.', 404)

  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile) throw new AppError('Profile not found.', 404)

  if (profile.gold < reward.goldCost) {
    throw new AppError('Not enough Gold', 400, { required: reward.goldCost, available: profile.gold })
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.rewardPurchase.findFirst({ where: { userId, rewardId } })
    if (existing) {
      return { alreadyRedeemed: true, reward, balance: profile.gold }
    }

    const updatedProfile = await tx.profile.update({
      where: { userId },
      data: { gold: { decrement: reward.goldCost } },
    })

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

    return { alreadyRedeemed: false, reward, balance: updatedProfile.gold, purchase }
  })
}
