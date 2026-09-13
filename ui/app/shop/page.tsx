'use client'

import { motion } from 'motion/react'
import { Coins, Lock } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { PageHeader } from '@/components/page-header'
import { AnimatedNumber } from '@/components/animated-number'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ShopPage() {
  const { rewards, gold, redeemReward } = useGame()

  return (
    <>
      <PageHeader
        eyebrow="Reward Shop"
        title="Spend Your Gold"
        subtitle="You earned it. Trade Gold for real-life rewards and treat yourself, guilt-free."
        action={
          <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2.5">
            <Coins className="size-5 text-[var(--gold)]" />
            <span className="font-display text-xl font-bold tabular-nums text-[var(--gold)]">
              <AnimatedNumber value={gold} />
            </span>
            <span className="text-sm font-medium text-muted-foreground">Gold</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward, i) => {
          const Icon = reward.icon
          const affordable = gold >= reward.cost
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.05,
                type: 'spring',
                stiffness: 260,
                damping: 26,
              }}
              className="glass group relative flex flex-col overflow-hidden rounded-2xl p-5"
            >
              <div className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-[var(--gold)]/10 blur-2xl transition-opacity group-hover:opacity-100" />

              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'grid size-14 place-items-center rounded-2xl transition-transform group-hover:scale-105',
                    affordable
                      ? 'bg-gradient-to-br from-[var(--gold)]/25 to-[var(--violet)]/20 text-[var(--gold)]'
                      : 'bg-white/5 text-muted-foreground',
                  )}
                >
                  <Icon className="size-7" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 font-display text-sm font-bold text-[var(--gold)]">
                  <Coins className="size-3.5" />
                  {reward.cost.toLocaleString()}
                </span>
              </div>

              <h3 className="mt-4 font-display text-lg font-bold">{reward.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {reward.description}
              </p>

              <Button
                onClick={() => redeemReward(reward)}
                disabled={!affordable}
                className={cn(
                  'mt-4 h-11 w-full gap-2 font-semibold',
                  affordable
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'cursor-not-allowed bg-white/5 text-muted-foreground hover:bg-white/5',
                )}
              >
                {affordable ? (
                  'Redeem'
                ) : (
                  <>
                    <Lock className="size-4" />
                    {(reward.cost - gold).toLocaleString()} more Gold
                  </>
                )}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
