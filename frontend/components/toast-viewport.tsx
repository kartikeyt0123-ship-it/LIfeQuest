'use client'

import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Coins, Sparkles, XCircle } from 'lucide-react'
import { useGame, type Toast } from '@/lib/game-context'

const toneMeta: Record<
  Toast['tone'],
  { icon: typeof CheckCircle2; color: string }
> = {
  success: { icon: CheckCircle2, color: 'var(--success)' },
  gold: { icon: Coins, color: 'var(--gold)' },
  xp: { icon: Sparkles, color: 'var(--violet)' },
  error: { icon: XCircle, color: 'var(--destructive)' },
}

export function ToastViewport() {
  const { toasts, dismissToast } = useGame()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => {
          const meta = toneMeta[toast.tone]
          const Icon = meta.icon
          return (
            <motion.button
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              onClick={() => dismissToast(toast.id)}
              className="glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-3.5 text-left"
            >
              <span
                className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl"
                style={{
                  background: `color-mix(in oklch, ${meta.color} 18%, transparent)`,
                  color: meta.color,
                }}
              >
                <Icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{toast.title}</span>
                {toast.description && (
                  <span className="text-xs text-muted-foreground">
                    {toast.description}
                  </span>
                )}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
