'use client'

import { Coins, Flame } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { XpBar } from '@/components/xp-bar'
import { AnimatedNumber } from '@/components/animated-number'

export function PlayerStatus() {
  const { level, xp, xpToNext, gold, streak } = useGame()

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[0_10px_40px_-12px_var(--violet)]">
            <span className="font-display text-2xl font-bold text-primary-foreground">
              {level}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Level
            </span>
            <span className="font-display text-2xl font-bold leading-tight">
              Warrior Tier
            </span>
          </div>
        </div>

        <div className="flex-1 sm:px-4">
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-medium text-muted-foreground">Experience</span>
            <span className="font-display font-semibold tabular-nums">
              <AnimatedNumber value={xp} />
              <span className="text-muted-foreground">
                {' '}
                / {xpToNext.toLocaleString()} XP
              </span>
            </span>
          </div>
          <XpBar value={xp} max={xpToNext} />
        </div>

        <div className="flex gap-3">
          <StatPill
            icon={<Coins className="size-5 text-[var(--gold)]" />}
            value={<AnimatedNumber value={gold} />}
            label="Gold"
            color="var(--gold)"
          />
          <StatPill
            icon={<Flame className="size-5 text-[var(--success)]" />}
            value={`${streak}`}
            label="Day Streak"
            color="var(--success)"
          />
        </div>
      </div>
    </div>
  )
}

function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  color: string
}) {
  return (
    <div
      className="flex flex-1 items-center gap-3 rounded-2xl border px-3.5 py-2.5 sm:flex-none"
      style={{
        borderColor: `color-mix(in oklch, ${color} 25%, transparent)`,
        background: `color-mix(in oklch, ${color} 8%, transparent)`,
      }}
    >
      {icon}
      <div className="flex flex-col leading-tight">
        <span className="font-display text-lg font-bold tabular-nums">
          {value}
        </span>
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
      </div>
    </div>
  )
}
