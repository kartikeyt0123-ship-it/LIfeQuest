'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowUpRight, Check, Flame, Plus, Sparkles, Target, Trophy } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { PlayerStatus } from '@/components/player-status'
import { QuestCard } from '@/components/quest-card'
import { HabitCard } from '@/components/habit-card'
import { CreateQuestModal } from '@/components/create-quest-modal'
import { Button } from '@/components/ui/button'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, type: 'spring', stiffness: 260, damping: 26 } }) }

export function DashboardPage() {
  const { quests, habits, streak, achievements } = useGame()
  const [modalOpen, setModalOpen] = useState(false)
  const active = quests.filter((q) => !q.completed)
  const done = quests.filter((q) => q.completed)
  const checkedIn = habits.filter((habit) => habit.week[habit.week.length - 1]).length
  const todayProgress = quests.length ? Math.round((done.length / quests.length) * 100) : 0
  const recentUnlocked = achievements.filter((a) => a.unlocked).slice(0, 2)

  return <>
    <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#171124] shadow-[0_30px_90px_-45px_var(--violet)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,oklch(0.62_0.24_300_/_0.24),transparent_34%),radial-gradient(circle_at_15%_100%,oklch(0.7_0.17_245_/_0.12),transparent_42%)]" />
      <div className="relative grid min-h-[270px] grid-cols-1 items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_260px] lg:p-10">
        <div className="max-w-xl"><div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[var(--gold)] uppercase"><Sparkles className="size-4" /> Monday, September 14</div><h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Make today <span className="text-gradient">count.</span></h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">Your next level is built from the small things you choose to finish.</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => setModalOpen(true)} className="h-11 gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />New quest</Button><Link href="/character" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold transition-colors hover:bg-white/10">View character <ArrowUpRight className="size-4" /></Link></div></div>
        <div className="pointer-events-none absolute right-0 bottom-0 hidden h-[310px] w-[280px] lg:block"><img src="/warrior-avatar.png" alt="Your warrior character" className="relative h-full w-full object-contain object-bottom drop-shadow-[0_18px_30px_oklch(0.62_0.24_300_/_0.3)]" /></div><div className="absolute right-6 top-6 hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-[var(--success)] lg:flex"><span className="size-1.5 rounded-full bg-[var(--success)]" /> On track</div>
      </div>
    </section>
    <div className="mb-8 grid gap-3 sm:grid-cols-3"><Metric icon={<Check className="size-5" />} value={`${done.length}/${quests.length}`} label="Quests cleared" color="var(--success)" /><Metric icon={<Flame className="size-5" />} value={`${streak} days`} label="Current streak" color="var(--gold)" /><Metric icon={<Target className="size-5" />} value={`${todayProgress}%`} label="Daily progress" color="var(--violet)" /></div>
    <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}><PlayerStatus /></motion.div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><div><div className="mb-3 flex items-end justify-between"><div><p className="mb-1 text-xs font-semibold tracking-[0.25em] text-primary uppercase">Daily rituals</p><h2 className="font-display text-2xl font-bold">Habits to keep</h2></div><Link href="/habits" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">All habits <ArrowUpRight className="size-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2">{habits.slice(0, 4).map((habit, i) => <motion.div key={habit.id} initial="hidden" animate="show" variants={fadeUp} custom={i + 1}><HabitCard habit={habit} /></motion.div>)}</div><div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3 text-sm"><span className="text-muted-foreground">Today&apos;s habit check-ins</span><span className="font-semibold text-[var(--success)]">{checkedIn}/{habits.length} complete</span></div></div><div><div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><Target className="size-5 text-primary" />Today&apos;s quests<span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">{active.length}</span></h2><Link href="/quests" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">View all <ArrowUpRight className="size-4" /></Link></div><div className="flex flex-col gap-3">{active.map((quest, i) => <motion.div key={quest.id} initial="hidden" animate="show" variants={fadeUp} custom={i + 1}><QuestCard quest={quest} /></motion.div>)}{active.length === 0 && <div className="glass grid place-items-center rounded-2xl p-10 text-center"><Trophy className="mb-2 size-8 text-[var(--gold)]" /><p className="font-display font-semibold">All quests cleared</p></div>}</div>{done.length > 0 && <><h3 className="mt-6 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Completed today</h3><div className="flex flex-col gap-3">{done.map((quest) => <QuestCard key={quest.id} quest={quest} />)}</div></>}<section className="glass mt-6 rounded-2xl p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Achievements</h2><Link href="/achievements" className="text-sm text-muted-foreground hover:text-foreground">All</Link></div>{recentUnlocked.map((a) => { const Icon = a.icon; return <div key={a.id} className="mb-3 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)]"><Icon className="size-5" /></span><div><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.description}</p></div></div> })}</section></div></div>
    <CreateQuestModal open={modalOpen} onOpenChange={setModalOpen} />
  </>
}

function Metric({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) { return <div className="glass flex items-center gap-3 rounded-2xl p-4"><span className="grid size-10 place-items-center rounded-xl" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>{icon}</span><div><p className="font-display text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div> }
