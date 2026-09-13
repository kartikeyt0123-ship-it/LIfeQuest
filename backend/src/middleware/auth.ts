import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'

const revokedTokens = new Set<string>()

export function revokeToken(token: string) {
  revokedTokens.add(token)
}

export type AuthUser = { id: string; email: string; name: string }
export type AuthenticatedRequest = Request & { user?: AuthUser }

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Please log in again.' })
  }
  try {
    if (revokedTokens.has(token)) return res.status(401).json({ message: 'Please log in again.' })
    const secret = process.env.JWT_SECRET ?? 'development-secret'
    const payload = jwt.verify(token, secret) as { userId: string }
    const sessionUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    })

    if (!sessionUser) {
      return res.status(401).json({ message: 'Please log in again.' })
    }

    req.user = sessionUser
    return next()
  } catch {
    return res.status(401).json({ message: 'Please log in again.' })
  }
}
