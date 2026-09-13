'use client'

import { motion } from 'motion/react'
import type { Stat } from '@/lib/game-data'

export function StatList({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-col gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div key={stat.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Icon className="size-4" style={{ color: stat.accent }} />
                {stat.name}
              </span>
              <span className="font-display font-semibold tabular-nums">
                {stat.value}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-inset ring-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: stat.accent,
                  boxShadow: `0 0 12px -2px ${stat.accent}`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{
                  type: 'spring',
                  stiffness: 80,
                  damping: 18,
                  delay: 0.1 + i * 0.08,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
