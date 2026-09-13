import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export type AuthenticatedRequest = Request & {
  user?: {
    id: string
    email: string
    name: string
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Please log in again.' })
  }

  try {
    const secret = process.env.JWT_SECRET ?? 'development-secret'
    const payload = jwt.verify(token, secret) as { userId: string }
    const sessionUser = (globalThis as typeof globalThis & { __lifequestSessions?: Record<string, { id: string; email: string; name: string }> }).__lifequestSessions?.[token]

    if (!sessionUser || sessionUser.id !== payload.userId) {
      return res.status(401).json({ message: 'Please log in again.' })
    }

    req.user = sessionUser
    return next()
  } catch {
    return res.status(401).json({ message: 'Please log in again.' })
  }
}
