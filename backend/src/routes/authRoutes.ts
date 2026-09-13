import { Router } from 'express'
import { registerUser, loginUser, getCurrentUser } from '../services/authService.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {}
    const payload = await registerUser(String(name ?? ''), String(email ?? ''), String(password ?? ''))
    return res.status(201).json(payload)
  } catch (error) {
    const payload = error instanceof Error ? { message: error.message } : { message: 'Something went wrong. Please try again.' }
    const code = (error as { statusCode?: number })?.statusCode ?? 500
    return res.status(code).json(payload)
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {}
    const payload = await loginUser(String(email ?? ''), String(password ?? ''))
    return res.json(payload)
  } catch (error) {
    const payload = error instanceof Error ? { message: error.message } : { message: 'Something went wrong. Please try again.' }
    const code = (error as { statusCode?: number })?.statusCode ?? 500
    return res.status(code).json(payload)
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req.user!.id)
    return res.json({ user })
  } catch (error) {
    const payload = error instanceof Error ? { message: error.message } : { message: 'Something went wrong. Please try again.' }
    const code = (error as { statusCode?: number })?.statusCode ?? 500
    return res.status(code).json(payload)
  }
})

export default router
