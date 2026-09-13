'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { Coins, Flame, ScrollText, Trophy } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { PageHeader } from '@/components/page-header'
import { StatList } from '@/components/stat-list'
import { XpBar } from '@/components/xp-bar'
import { AnimatedNumber } from '@/components/animated-number'

export default function CharacterPage() {
  const { level, xp, xpToNext, gold, streak, stats, quests, achievements } =
    useGame()

  const questsDone = quests.filter((q) => q.completed).length
  const achievementsDone = achievements.filter((a) => a.unlocked).length

  const totals = [
    {
      label: 'Quests Completed',
      value: questsDone,
      icon: ScrollText,
      color: 'var(--violet)',
    },
    {
      label: 'Achievements',
      value: achievementsDone,
      icon: Trophy,
      color: 'var(--gold)',
    },
    { label: 'Total Gold', value: gold, icon: Coins, color: 'var(--gold)' },
    {
      label: 'Day Streak',
      value: streak,
      icon: Flame,
      color: 'var(--success)',
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Your Hero"
        title="Character Sheet"
        subtitle="The living record of everything you've built. This is who you're becoming."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="glass relative overflow-hidden rounded-3xl p-6 lg:col-span-2"
        >
          <div className="pointer-events-none absolute inset-x-0 -top-10 h-48 bg-gradient-to-b from-primary/25 to-transparent blur-2xl" />

          <div className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src="/warrior-avatar.png"
                alt="Your warrior character portrait"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-display text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-6px_var(--violet)]">
                Level {level}
              </span>
            </div>

            <h2 className="mt-5 text-center font-display text-2xl font-bold">
              Warrior
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              Warrior Tier · Productivity Legend
            </p>

            <div className="mt-5">
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Level {level} → {level + 1}
                </span>
                <span className="font-display font-semibold tabular-nums">
                  {xp.toLocaleString()} / {xpToNext.toLocaleString()}
                </span>
              </div>
              <XpBar value={xp} max={xpToNext} />
            </div>
          </div>
        </motion.section>

        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="grid grid-cols-2 gap-4">
            {totals.map((t, i) => {
              const Icon = t.icon
              return (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + i * 0.06,
                    type: 'spring',
                    stiffness: 260,
                    damping: 26,
                  }}
                  className="glass flex items-center gap-3 rounded-2xl p-4"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: `color-mix(in oklch, ${t.color} 16%, transparent)`,
                      color: t.color,
                    }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl font-bold tabular-nums">
                      <AnimatedNumber value={t.value} />
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.label}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 26 }}
            className="glass flex-1 rounded-3xl p-6"
          >
            <h2 className="mb-5 font-display text-lg font-bold">Attributes</h2>
            <StatList stats={stats} />
          </motion.section>
        </div>
      </div>
    </>
  )
}
