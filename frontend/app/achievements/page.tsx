'use client'

import { motion } from 'motion/react'
import { Check, Lock } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'

export default function AchievementsPage() {
  const { achievements } = useGame()
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <>
      <PageHeader
        eyebrow="Hall of Fame"
        title="Achievements"
        subtitle="Milestones that mark your journey. Unlock them all to become a legend."
        action={
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-center">
            <p className="font-display text-xl font-bold text-primary">
              {unlocked}/{achievements.length}
            </p>
            <p className="text-xs font-medium text-muted-foreground">Unlocked</p>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => {
          const Icon = a.icon
          const pct = Math.min(100, (a.progress / a.goal) * 100)
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.05,
                type: 'spring',
                stiffness: 260,
                damping: 26,
              }}
              className={cn(
                'glass relative flex flex-col overflow-hidden rounded-2xl p-5',
                !a.unlocked && 'opacity-90',
              )}
            >
              {a.unlocked && (
                <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--gold)] uppercase">
                  <Check className="size-3" />
                  Unlocked
                </span>
              )}

              <span
                className={cn(
                  'grid size-14 place-items-center rounded-2xl',
                  a.unlocked
                    ? 'bg-gradient-to-br from-[var(--gold)]/25 to-[var(--violet)]/25 text-[var(--gold)]'
                    : 'bg-white/5 text-muted-foreground',
                )}
              >
                {a.unlocked ? (
                  <Icon className="size-7" />
                ) : (
                  <Lock className="size-6" />
                )}
              </span>

              <h3 className="mt-4 font-display text-lg font-bold">{a.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {a.description}
              </p>

              {!a.unlocked && (
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground tabular-nums">
                    <span>Progress</span>
                    <span>
                      {a.progress.toLocaleString()} / {a.goal.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/40 ring-1 ring-inset ring-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        type: 'spring',
                        stiffness: 80,
                        damping: 18,
                        delay: 0.15 + i * 0.05,
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
