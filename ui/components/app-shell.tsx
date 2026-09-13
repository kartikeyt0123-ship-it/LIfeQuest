'use client'

import type { ReactNode } from 'react'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { ToastViewport } from '@/components/toast-viewport'
import { LevelUpModal } from '@/components/level-up-modal'
import { AuthScreen } from '@/components/auth-screen'
import { useGame } from '@/lib/game-context'
import { usePathname } from 'next/navigation'

export function AppShell({ children }: { children: ReactNode }) {
  const { account, authLoading } = useGame()
  const pathname = usePathname()
  const publicRoute = pathname === '/' || pathname === '/login' || pathname === '/signup'

  if (authLoading && !publicRoute) return <div className="grid min-h-dvh place-items-center bg-background text-sm text-muted-foreground">Loading your quest log...</div>
  if (!account && !publicRoute) return <AuthScreen />
  if (publicRoute && !account) return <>{children}</>
  if (publicRoute && account && pathname !== '/') return <>{children}</>

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="relative flex-1 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
      <MobileNav />
      <ToastViewport />
      <LevelUpModal />
    </div>
  )
}
