'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Sparkles, UserCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { navItems } from '@/lib/nav'
import { useGame } from '@/lib/game-context'

export function Sidebar() {
  const pathname = usePathname()
  const { level, account, signOut } = useGame()

  return (
    <aside className="glass sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-2 border-r p-5 lg:flex">
      <Link href="/" className="mb-4 flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_30px_-8px_var(--violet)]">
          <Sparkles className="size-5" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-lg font-bold tracking-tight">
            LifeQuest
          </span>
          <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            Level {level} Warrior
          </span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl border border-primary/40 bg-primary/15"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <item.icon
                className={cn(
                  'size-[18px] transition-transform group-hover:scale-110',
                  active && 'text-primary',
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
        <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <Settings className="size-[18px]" />
          Settings
        </button>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground">
            W
          </span>
          <span className="flex flex-col leading-tight">
            <span className="max-w-[120px] truncate text-sm font-semibold">{account?.name}</span>
            <span className="max-w-[120px] truncate text-xs text-muted-foreground">{account?.email}</span>
          </span>
          <button onClick={() => void signOut()} className="ml-auto rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground" aria-label="Sign out" title="Sign out"><UserCircle2 className="size-4" /></button>
        </div>
      </div>
    </aside>
  )
}
