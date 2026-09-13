import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listHabits, toggleHabit } from '../services/habitService.js'
import { getUserState } from '../services/progressionService.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    return res.json(await listHabits(req.user!.id))
  } catch {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
})

router.post('/:id/toggle', async (req, res) => {
  try {
    await toggleHabit(req.user!.id, String(req.params.id))
    return res.json(await getUserState(req.user!.id))
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

export default router
