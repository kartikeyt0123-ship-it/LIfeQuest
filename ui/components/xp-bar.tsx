'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export function XpBar({
  value,
  max,
  className,
  height = 'h-3',
}: {
  value: number
  max: number
  className?: string
  height?: string
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-inset ring-white/10',
        height,
        className,
      )}
    >
      <motion.div
        className="relative h-full rounded-full bg-gradient-to-r from-secondary via-primary to-primary"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        style={{ boxShadow: '0 0 16px -2px var(--violet)' }}
      >
        <span
          className="absolute inset-0 -translate-x-full"
          style={{
            background:
              'linear-gradient(100deg, transparent, oklch(1 0 0 / 0.45), transparent)',
            animation: 'shimmer 2.4s ease-in-out infinite',
          }}
        />
      </motion.div>
    </div>
  )
}
