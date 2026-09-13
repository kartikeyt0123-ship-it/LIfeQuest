'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Coins, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  categoryMeta,
  difficultyMeta,
  type Difficulty,
  type QuestCategory,
} from '@/lib/game-data'
import { useGame } from '@/lib/game-context'

const rewardByDifficulty: Record<Difficulty, { xp: number; gold: number }> = {
  easy: { xp: 60, gold: 20 },
  medium: { xp: 100, gold: 40 },
  hard: { xp: 150, gold: 60 },
  epic: { xp: 220, gold: 90 },
}

const categories = Object.keys(categoryMeta) as QuestCategory[]
const difficulties = Object.keys(difficultyMeta) as Difficulty[]

export function CreateQuestModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addQuest } = useGame()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<QuestCategory>('study')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')

  const reward = rewardByDifficulty[difficulty]

  const reset = () => {
    setTitle('')
    setDescription('')
    setCategory('study')
    setDifficulty('medium')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addQuest({
      title: title.trim(),
      description: description.trim() || 'Complete this quest',
      category,
      difficulty,
      xp: reward.xp,
      gold: reward.gold,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[65] grid place-items-end p-0 sm:place-items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
          />

          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-strong relative z-10 w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">New Quest</h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Field label="Quest Title">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finish chapter 5"
                  className="h-11 w-full rounded-xl border border-input bg-black/30 px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </Field>

              <Field label="Description">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details"
                  className="h-11 w-full rounded-xl border border-input bg-black/30 px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </Field>

              <Field label="Category">
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => {
                    const Icon = categoryMeta[c].icon
                    const active = c === category
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all',
                          active
                            ? 'border-primary/50 bg-primary/15 text-foreground'
                            : 'border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground',
                        )}
                      >
                        <Icon className="size-4" />
                        {categoryMeta[c].label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label="Difficulty">
                <div className="grid grid-cols-4 gap-2">
                  {difficulties.map((d) => {
                    const meta = difficultyMeta[d]
                    const active = d === difficulty
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          'rounded-xl border px-1 py-2 text-xs font-semibold transition-all',
                          active
                            ? 'text-foreground'
                            : 'border-white/10 text-muted-foreground hover:text-foreground',
                        )}
                        style={
                          active
                            ? {
                                borderColor: `color-mix(in oklch, ${meta.color} 55%, transparent)`,
                                background: `color-mix(in oklch, ${meta.color} 15%, transparent)`,
                              }
                            : undefined
                        }
                      >
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <div className="flex items-center justify-center gap-4 rounded-xl border border-white/10 bg-black/20 py-2.5 text-sm">
                <span className="text-muted-foreground">Rewards</span>
                <span className="flex items-center gap-1 font-semibold text-[var(--violet)]">
                  <Sparkles className="size-4" />+{reward.xp} XP
                </span>
                <span className="flex items-center gap-1 font-semibold text-[var(--gold)]">
                  <Coins className="size-4" />+{reward.gold} Gold
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-5 h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Add Quest
            </Button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  )
}
