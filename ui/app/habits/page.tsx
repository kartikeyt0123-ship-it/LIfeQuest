'use client'

import { motion } from 'motion/react'
import { Flame, TrendingUp } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { HabitCard } from '@/components/habit-card'
import { PageHeader } from '@/components/page-header'

export default function HabitsPage() {
  const { habits } = useGame()

  const longest = habits.reduce((m, h) => Math.max(m, h.streak), 0)
  const totalActive = habits.filter(
    (h) => h.week[h.week.length - 1],
  ).length

  return (
    <>
      <PageHeader
        eyebrow="Daily Rituals"
        title="Habit Streaks"
        subtitle="Consistency compounds. Keep your streaks alive to build lasting momentum."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="glass flex items-center gap-4 rounded-2xl p-5">
          <span className="grid size-12 place-items-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)]">
            <Flame className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold tabular-nums">
              {longest}
            </p>
            <p className="text-sm text-muted-foreground">Longest active streak</p>
          </div>
        </div>
        <div className="glass flex items-center gap-4 rounded-2xl p-5">
          <span className="grid size-12 place-items-center rounded-xl bg-[var(--success)]/15 text-[var(--success)]">
            <TrendingUp className="size-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold tabular-nums">
              {totalActive}/{habits.length}
            </p>
            <p className="text-sm text-muted-foreground">Checked in today</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {habits.map((habit, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.06,
              type: 'spring',
              stiffness: 260,
              damping: 26,
            }}
          >
            <HabitCard habit={habit} />
          </motion.div>
        ))}
      </div>
    </>
  )
}
