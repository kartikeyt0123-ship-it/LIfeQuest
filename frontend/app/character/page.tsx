'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Check,
  Coins,
  Flame,
  Lock,
  ScrollText,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { PageHeader } from '@/components/page-header'
import { StatList } from '@/components/stat-list'
import { XpBar } from '@/components/xp-bar'
import { AnimatedNumber } from '@/components/animated-number'

const fallbackMilestones = [
  {
    level: 13,
    rank: 'Legend',
    cardName: 'Legend',
    description: 'Consistency turns effort into identity.',
  },
  {
    level: 14,
    rank: 'Elite',
    cardName: 'Elite',
    description: 'Discipline becomes second nature.',
  },
  {
    level: 15,
    rank: 'Master',
    cardName: 'Master',
    description: 'Small actions. Extraordinary results.',
  },
]

export default function CharacterPage() {
  const { level, xp, xpToNext, gold, streak, stats, quests, achievements, lifeCards } =
    useGame()

  const milestones = lifeCards.length
    ? lifeCards.map((card) => ({
        level: card.levelRequired,
        rank: card.name,
        cardName: card.name,
        description: card.description,
      }))
    : fallbackMilestones

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

      <section className="mt-8 pt-2">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
              Your Journey
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Keep going. There&apos;s more ahead.
            </h2>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-8 right-8 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {milestones.map((milestone, index) => {
              const isUnlocked = level >= milestone.level
              const isNext = level + 1 === milestone.level
              const isLocked = !isUnlocked && !isNext
              const accent = isUnlocked
                ? 'var(--gold)'
                : isNext
                  ? 'var(--violet)'
                  : 'oklch(1 0 0 / 0.3)'

              return (
                <motion.article
                  key={milestone.level}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 26 }}
                  className={[
                    'group relative overflow-hidden rounded-[1.75rem] border p-5 transition-all duration-300',
                    isUnlocked
                      ? 'border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/[0.10] via-white/[0.03] to-primary/[0.08]'
                      : isNext
                        ? 'border-primary/40 bg-gradient-to-br from-primary/15 via-white/[0.04] to-[var(--gold)]/8 shadow-[0_18px_48px_-24px_var(--violet)]'
                        : 'border-white/10 bg-white/[0.02]',
                  ].join(' ')}
                  style={{
                    boxShadow: isNext
                      ? '0 20px 50px -32px oklch(0.68 0.2 300 / 0.5)'
                      : undefined,
                  }}
                >
                  <div
                    className="absolute inset-x-5 top-0 h-px opacity-80"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                  />

                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div
                      className="grid size-12 place-items-center rounded-2xl border"
                      style={{
                        borderColor: `color-mix(in oklch, ${accent} 40%, transparent)`,
                        background: `color-mix(in oklch, ${accent} 12%, transparent)`,
                        color: accent,
                      }}
                    >
                      {isUnlocked ? <Check className="size-5" /> : <Lock className="size-4" />}
                    </div>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em] uppercase"
                      style={{
                        borderColor: `color-mix(in oklch, ${accent} 42%, transparent)`,
                        color: accent,
                        background: `color-mix(in oklch, ${accent} 8%, transparent)`,
                      }}
                    >
                      {isUnlocked ? 'Unlocked' : isNext ? 'Next' : 'Locked'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                        Level {milestone.level}
                      </p>
                      <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">
                        {milestone.rank}
                      </h3>
                    </div>

                    {isUnlocked ? (
                      <div className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold)]/[0.06] p-3 text-sm text-[var(--gold)]">
                        <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.16em]">
                          <Sparkles className="size-3.5" />
                          Life Card Unlocked
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          <Lock className="size-3.5" />
                          Unlock at Level {milestone.level}
                        </div>
                      </div>
                    )}

                    <p className="text-sm leading-6 text-muted-foreground">
                      {milestone.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/8 pt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <span>{isUnlocked ? 'Reward' : 'Reward:'}</span>
                      <span style={{ color: accent }}>{milestone.cardName} Life Card</span>
                    </div>

                    {isUnlocked && (
                      <button className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[var(--gold)]/25 bg-[var(--gold)]/[0.07] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
                        View Life Card <ArrowRight className="size-3.5" />
                      </button>
                    )}
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-display text-lg font-bold">Life Card Collection</h3>
            <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {milestones.filter((m) => level >= m.level).length}/{milestones.length} Unlocked
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {milestones.map((milestone) => {
              const unlocked = level >= milestone.level
              return (
                <div
                  key={milestone.level}
                  className={[
                    'flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium',
                    unlocked
                      ? 'border-[var(--gold)]/30 bg-[var(--gold)]/[0.08] text-[var(--gold)]'
                      : 'border-white/10 bg-white/[0.02] text-muted-foreground',
                  ].join(' ')}
                >
                  <span className="text-xs uppercase tracking-[0.18em]">
                    {unlocked ? '✓' : '🔒'}
                  </span>
                  {milestone.cardName}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
