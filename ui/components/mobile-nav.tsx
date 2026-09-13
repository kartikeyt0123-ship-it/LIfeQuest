'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navItems } from '@/lib/nav'
import { useGame } from '@/lib/game-context'

export function MobileNav() {
  const pathname = usePathname()
  const { signOut } = useGame()

  return (
    <nav className="glass-strong fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden">
      {navItems.map((item) => {
        const active =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId="mobile-active"
                className="absolute -top-0.5 h-1 w-8 rounded-full bg-primary shadow-[0_0_12px_var(--violet)]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <item.icon className="size-5" />
            <span className="max-w-full truncate">
              {item.label === 'Reward Shop' ? 'Shop' : item.label}
            </span>
          </Link>
        )
      })}
      <button onClick={() => void signOut()} className="flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium text-muted-foreground" aria-label="Sign out">
        <LogOut className="size-5" />
        <span>Sign out</span>
      </button>
    </nav>
  )
}
