import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listRewards, redeemReward } from '../services/rewardService.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const rewards = await listRewards()
    return res.json(rewards)
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

router.post('/:rewardId/redeem', requireAuth, async (req, res) => {
  try {
    const result = await redeemReward(req.user!.id, String(req.params.rewardId))
    return res.json(result)
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    const details = (error as { details?: { required?: number; available?: number } })?.details
    return res.status(status).json({ message, ...(details ?? {}) })
  }
})

export default router
