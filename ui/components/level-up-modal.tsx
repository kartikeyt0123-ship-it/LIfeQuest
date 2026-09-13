'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Coins, Sparkles } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { Button } from '@/components/ui/button'

const PARTICLES = Array.from({ length: 22 })

export function LevelUpModal() {
  const { levelUp, clearLevelUp } = useGame()

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close"
            onClick={clearLevelUp}
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="glass-strong relative z-10 w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center"
          >
            {/* particle burst */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              {PARTICLES.map((_, i) => {
                const angle = (i / PARTICLES.length) * Math.PI * 2
                const dist = 120 + (i % 3) * 40
                return (
                  <motion.span
                    key={i}
                    className="absolute size-1.5 rounded-full"
                    style={{
                      background:
                        i % 2 === 0 ? 'var(--gold)' : 'var(--violet)',
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: [0, 1, 0],
                      scale: [0, 1.4, 0.5],
                    }}
                    transition={{
                      duration: 1.1,
                      delay: 0.1 + (i % 5) * 0.03,
                      ease: 'easeOut',
                    }}
                  />
                )
              })}
            </div>

            <motion.div
              className="relative mx-auto mb-5 grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary"
              animate={{
                boxShadow: [
                  '0 0 0px var(--violet)',
                  '0 0 44px var(--violet)',
                  '0 0 16px var(--violet)',
                ],
              }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <Sparkles className="size-9 text-primary-foreground" />
            </motion.div>

            <p className="font-display text-xs font-bold tracking-[0.3em] text-primary uppercase">
              Level Up
            </p>

            <div className="mt-3 flex items-center justify-center gap-4">
              <span className="font-display text-4xl font-bold text-muted-foreground">
                {levelUp.from}
              </span>
              <ArrowRight className="size-6 text-primary" />
              <motion.span
                className="font-display text-6xl font-bold text-gradient"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.15 }}
              >
                {levelUp.to}
              </motion.span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              New level unlocked. Your legend grows.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-1.5 text-sm font-semibold text-[var(--gold)]">
              <Coins className="size-4" />+{levelUp.goldBonus} Gold Bonus
            </div>

            <Button
              onClick={clearLevelUp}
              className="mt-6 h-11 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
