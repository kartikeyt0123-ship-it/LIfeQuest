'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  initialAchievements,
  initialHabits,
  initialQuests,
  initialStats,
  rewards as rewardCatalog,
  type Achievement,
  type Difficulty,
  type Habit,
  type Quest,
  type QuestCategory,
  type Reward,
  type Stat,
} from '@/lib/game-data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export type Toast = {
  id: number
  title: string
  description?: string
  tone: 'xp' | 'gold' | 'success' | 'error'
}

export type LevelUpInfo = {
  from: number
  to: number
  goldBonus: number
}

type Player = {
  level: number
  xp: number
  xpToNext: number
  gold: number
}

type NewQuestInput = {
  title: string
  description: string
  category: QuestCategory
  difficulty: Difficulty
  xp: number
  gold: number
}

type ApiState = {
  player?: Player
  quests?: Quest[]
  habits?: Habit[]
  levelUp?: LevelUpInfo | null
}

export type Account = { id: string; email: string; name: string }

type GameContextValue = {
  account: Account | null
  authLoading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  level: number
  xp: number
  xpToNext: number
  gold: number
  streak: number
  quests: Quest[]
  habits: Habit[]
  achievements: Achievement[]
  rewards: Reward[]
  redeemingRewardId: string | null
  stats: Stat[]
  toasts: Toast[]
  levelUp: LevelUpInfo | null
  completeQuest: (id: string) => void
  addQuest: (input: NewQuestInput) => void
  redeemReward: (reward: Reward) => void
  toggleHabitToday: (id: string) => void
  dismissToast: (id: number) => void
  clearLevelUp: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

let toastId = 0

export function GameProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [player, setPlayer] = useState<Player>({
    level: 12,
    xp: 2450,
    xpToNext: 3000,
    gold: 1840,
  })
  const [streak] = useState(12)

  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [achievements] = useState<Achievement[]>(initialAchievements)
  const [stats] = useState<Stat[]>(initialStats)
  const [rewards, setRewards] = useState<Reward[]>(rewardCatalog)
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null)

  const [toasts, setToasts] = useState<Toast[]>([])
  const [levelUp, setLevelUp] = useState<LevelUpInfo | null>(null)

  const applyApiState = useCallback((next: ApiState) => {
    if (next.player) setPlayer(next.player)
    if (next.quests) setQuests(next.quests)
    if (next.habits) setHabits((previous) =>
      next.habits!.map((habit) => ({
        ...habit,
        icon: previous.find((item) => item.id === habit.id)?.icon ?? habit.icon,
      })),
    )
  }, [])

  const requestState = useCallback(async (path: string, options?: RequestInit) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('lifequest-token') : null
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.message || payload.error || 'Something went wrong. Please try again.')
    applyApiState(payload)
    return payload as ApiState
  }, [applyApiState])

  const loadRewards = useCallback(async () => {
    const token = localStorage.getItem('lifequest-token')
    const response = await fetch(`${API_BASE}/rewards`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.message || 'Something went wrong. Please try again.')
    const nextRewards = payload.flatMap((reward: { id: string; name: string; description: string; goldCost: number }) => {
      const catalogReward = rewardCatalog.find((item) => item.name === reward.name)
      return catalogReward
        ? [{ ...catalogReward, id: reward.id, description: reward.description, cost: reward.goldCost }]
        : []
    })
    setRewards(nextRewards)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { ...toast, id }])
      setTimeout(() => dismissToast(id), 3200)
    },
    [dismissToast],
  )

  const authenticate = useCallback(async (path: string, email: string, password: string, name?: string) => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.message || payload.error || 'Authentication failed')
    localStorage.setItem('lifequest-token', payload.token)
    localStorage.setItem('lifequest-account', JSON.stringify(payload.user))
    setAccount(payload.user)
    if (payload.state) applyApiState(payload.state)
    else if (payload.profile) {
      setPlayer((current) => ({
        ...current,
        level: payload.profile.level,
        xp: payload.profile.totalXp,
        gold: payload.profile.gold,
      }))
    }
    await loadRewards()
  }, [applyApiState, loadRewards])

  const signUp = useCallback((email: string, password: string, name?: string) => authenticate('/auth/register', email, password, name), [authenticate])
  const signIn = useCallback((email: string, password: string) => authenticate('/auth/login', email, password), [authenticate])
  const signOut = useCallback(async () => {
    const token = localStorage.getItem('lifequest-token')
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} })
    localStorage.removeItem('lifequest-token')
    localStorage.removeItem('lifequest-account')
    setAccount(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('lifequest-token')
    if (!token) { setAuthLoading(false); return }
    requestState('/state').then(() => loadRewards()).then(() => {
      const savedAccount = localStorage.getItem('lifequest-account')
      if (savedAccount) setAccount(JSON.parse(savedAccount))
    }).catch(() => localStorage.removeItem('lifequest-token')).finally(() => setAuthLoading(false))
  }, [loadRewards, requestState])

  const completeQuest = useCallback((id: string) => {
    const quest = quests.find((item) => item.id === id)
    if (!quest || quest.completed) return
    requestState(`/quests/${id}/complete`, { method: 'POST' })
      .then((next) => {
        if (next.levelUp) setLevelUp(next.levelUp)
        pushToast({ title: 'Quest Completed', description: `${quest.title} — +${quest.xp} XP, +${quest.gold} Gold`, tone: 'success' })
      })
      .catch((error: Error) => pushToast({ title: 'Could not complete quest', description: error.message, tone: 'error' }))
  }, [quests, requestState, pushToast])

  const addQuest = useCallback((input: NewQuestInput) => {
    requestState('/quests', { method: 'POST', body: JSON.stringify(input) })
      .then(() => pushToast({ title: 'New Quest Added', description: `${input.title} is ready to conquer`, tone: 'xp' }))
      .catch((error: Error) => pushToast({ title: 'Could not add quest', description: error.message, tone: 'error' }))
  }, [requestState, pushToast])

  const redeemReward = useCallback(
    (reward: Reward) => {
      if (player.gold < reward.cost) {
        pushToast({
          title: 'Not enough Gold',
          description: `You need ${reward.cost - player.gold} more Gold for ${reward.name}`,
          tone: 'error',
        })
        return
      }
      if (redeemingRewardId === reward.id) return
      setRedeemingRewardId(reward.id)
      requestState(`/rewards/${reward.id}/redeem`, { method: 'POST' })
        .then((payload) => {
          const redemption = payload as ApiState & { remainingGold?: number; goldSpent?: number }
          if (typeof redemption.remainingGold === 'number') {
            setPlayer((current) => ({ ...current, gold: redemption.remainingGold! }))
          }
          pushToast({ title: 'Reward unlocked', description: `${redemption.goldSpent ?? reward.cost} Gold spent`, tone: 'gold' })
        })
        .catch((error: Error) => pushToast({ title: 'Could not redeem reward', description: error.message, tone: 'error' }))
        .finally(() => setRedeemingRewardId(null))
    },
      [player.gold, pushToast, redeemingRewardId, requestState],
  )

  const toggleHabitToday = useCallback((id: string) => {
    requestState(`/habits/${id}/toggle`, { method: 'POST' })
      .catch((error: Error) => pushToast({ title: 'Could not update habit', description: error.message, tone: 'error' }))
  }, [requestState, pushToast])

  const clearLevelUp = useCallback(() => setLevelUp(null), [])

  const value = useMemo<GameContextValue>(
    () => ({
      account,
      authLoading,
      signUp,
      signIn,
      signOut,
      level: player.level,
      xp: player.xp,
      xpToNext: player.xpToNext,
      gold: player.gold,
      streak,
      quests,
      habits,
      achievements,
      rewards,
      redeemingRewardId,
      stats,
      toasts,
      levelUp,
      completeQuest,
      addQuest,
      redeemReward,
      toggleHabitToday,
      dismissToast,
      clearLevelUp,
    }),
    [
      account,
      authLoading,
      player,
      streak,
      quests,
      habits,
      achievements,
      rewards,
      redeemingRewardId,
      rewards,
      stats,
      toasts,
      levelUp,
      completeQuest,
      addQuest,
      redeemReward,
      toggleHabitToday,
      dismissToast,
      clearLevelUp,
      signUp,
      signIn,
      signOut,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
