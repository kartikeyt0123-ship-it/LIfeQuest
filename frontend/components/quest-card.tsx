'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Coins, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  categoryMeta,
  difficultyMeta,
  type Quest,
} from '@/lib/game-data'
import { useGame } from '@/lib/game-context'

export function QuestCard({ quest }: { quest: Quest }) {
  const { completeQuest, updateQuest, deleteQuest } = useGame()
  const [burst, setBurst] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(quest.title)
  const [description, setDescription] = useState(quest.description)
  const cat = categoryMeta[quest.category]
  const diff = difficultyMeta[quest.difficulty]
  const CatIcon = cat.icon

  const handleComplete = () => {
    if (quest.completed) return
    setBurst(true)
    completeQuest(quest.id)
    setTimeout(() => setBurst(false), 1400)
  }

  return (
    <motion.div
      layout
      className={cn(
        'glass group relative overflow-hidden rounded-2xl p-4 transition-colors',
        quest.completed && 'opacity-60',
      )}
      style={{
        borderColor: quest.completed
          ? undefined
          : `color-mix(in oklch, ${diff.color} 22%, transparent)`,
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: quest.completed ? 'var(--success)' : diff.color }}
      />

      {/* floating reward text */}
      <AnimatePresence>
        {burst && (
          <div className="pointer-events-none absolute top-2 right-16 z-10 flex flex-col items-end gap-1">
            <span
              className="font-display text-sm font-bold"
              style={{
                color: 'var(--violet)',
                animation: 'float-up 1.3s ease-out forwards',
              }}
            >
              +{quest.xp} XP
            </span>
            <span
              className="font-display text-sm font-bold"
              style={{
                color: 'var(--gold)',
                animation: 'float-up 1.3s ease-out 0.12s forwards',
              }}
            >
              +{quest.gold} Gold
            </span>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3 pl-2">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{
            background: `color-mix(in oklch, ${diff.color} 14%, transparent)`,
            color: diff.color,
          }}
        >
          <CatIcon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Quest title" className="h-9 w-full rounded-lg border border-white/15 bg-black/20 px-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40" />
              <input value={description} onChange={(event) => setDescription(event.target.value)} aria-label="Quest description" className="h-9 w-full rounded-lg border border-white/15 bg-black/20 px-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { updateQuest(quest.id, { title: title.trim(), description: description.trim() }); setEditing(false) }} className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-muted-foreground">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h3 className={cn('truncate font-display font-semibold', quest.completed && 'line-through')}>
                  {quest.title}
                </h3>
              </div>
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{quest.description}</p>
            </>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 font-medium text-muted-foreground">
              {cat.label}
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 font-medium">
              <span className="flex gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full"
                    style={{
                      background:
                        i < diff.dots ? diff.color : 'oklch(1 0 0 / 0.15)',
                    }}
                  />
                ))}
              </span>
              <span style={{ color: diff.color }}>{diff.label}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-[var(--violet)]">
              <Sparkles className="size-3.5" />
              {quest.xp}
            </span>
            <span className="flex items-center gap-1 font-semibold text-[var(--gold)]">
              <Coins className="size-3.5" />
              {quest.gold}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!quest.completed && <>
            <button type="button" onClick={() => setEditing(true)} aria-label={`Edit ${quest.title}`} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Pencil className="size-3.5" /></button>
            <button type="button" onClick={() => { if (window.confirm(`Delete ${quest.title}?`)) deleteQuest(quest.id) }} aria-label={`Delete ${quest.title}`} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"><Trash2 className="size-3.5" /></button>
          </>}
          <button
            onClick={handleComplete}
            disabled={quest.completed || editing}
            aria-label={quest.completed ? 'Completed' : `Complete ${quest.title}`}
            className={cn(
              'grid size-10 place-items-center rounded-xl border transition-all',
              quest.completed
                ? 'border-[var(--success)]/40 bg-[var(--success)]/15 text-[var(--success)]'
                : 'border-white/15 text-muted-foreground hover:scale-110 hover:border-[var(--success)]/50 hover:bg-[var(--success)]/10 hover:text-[var(--success)]',
            )}
          >
            <motion.span key={quest.completed ? 'done' : 'todo'} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
              <Check className="size-5" />
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
