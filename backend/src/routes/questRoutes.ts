import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createQuest, completeQuest, deleteQuest, getQuest, listQuests, updateQuest } from '../services/questService.js'
import { getUserState } from '../services/progressionService.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const quests = await listQuests(req.user!.id)
    return res.json(quests)
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

router.post('/', async (req, res) => {
  try {
    await createQuest(req.user!.id, req.body ?? {})
    return res.status(201).json(await getUserState(req.user!.id))
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const quest = await getQuest(req.user!.id, req.params.id)
    return res.json(quest)
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    await updateQuest(req.user!.id, req.params.id, req.body ?? {})
    return res.json(await getUserState(req.user!.id))
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await deleteQuest(req.user!.id, req.params.id)
    return res.json(await getUserState(req.user!.id))
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

router.post('/:id/complete', async (req, res) => {
  try {
    const result = await completeQuest(req.user!.id, req.params.id)
    return res.json({ ...(await getUserState(req.user!.id)), ...result, ok: true })
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode ?? 500
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return res.status(status).json({ message })
  }
})

export default router
