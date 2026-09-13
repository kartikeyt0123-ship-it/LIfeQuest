'use client'

import { motion } from 'motion/react'
import { Check, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/game-data'
import { useGame } from '@/lib/game-context'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function lastSevenLabels() {
  const today = new Date().getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const idx = (today - 6 + i + 7) % 7
    return DAY_LETTERS[idx]
  })
}

export function HabitCard({ habit }: { habit: Habit }) {
  const { toggleHabitToday } = useGame()
  const Icon = habit.icon
  const labels = lastSevenLabels()
  const doneToday = habit.week[habit.week.length - 1]

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span
          className="grid size-11 place-items-center rounded-xl"
          style={{
            background: `color-mix(in oklch, ${habit.accent} 16%, transparent)`,
            color: habit.accent,
          }}
        >
          <Icon className="size-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-display font-semibold">{habit.name}</h3>
          <p
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: habit.accent }}
          >
            <Flame className="size-3.5" />
            {habit.streak} day streak
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-1.5">
        {habit.week.map((done, i) => {
          const isToday = i === habit.week.length - 1
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {labels[i]}
              </span>
              <motion.span
                initial={false}
                animate={{ scale: done ? 1 : 0.9 }}
                className={cn(
                  'grid aspect-square w-full max-w-9 place-items-center rounded-lg border transition-colors',
                  done ? 'border-transparent' : 'border-white/10 bg-black/20',
                  isToday && !done && 'border-dashed border-white/30',
                )}
                style={
                  done
                    ? {
                        background: `color-mix(in oklch, ${habit.accent} 22%, transparent)`,
                        color: habit.accent,
                      }
                    : undefined
                }
              >
                {done && <Check className="size-3.5" />}
              </motion.span>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => toggleHabitToday(habit.id)}
        className={cn(
          'mt-4 h-10 w-full rounded-xl border text-sm font-semibold transition-all',
          doneToday
            ? 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'
            : 'border-transparent text-primary-foreground hover:brightness-110',
        )}
        style={
          doneToday
            ? undefined
            : { background: habit.accent, color: 'oklch(0.15 0.02 275)' }
        }
      >
        {doneToday ? 'Completed Today' : 'Check In Today'}
      </button>
    </div>
  )
}
