'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { categoryMeta, type QuestCategory } from '@/lib/game-data'
import { QuestCard } from '@/components/quest-card'
import { CreateQuestModal } from '@/components/create-quest-modal'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Filter = 'all' | QuestCategory
const categories = Object.keys(categoryMeta) as QuestCategory[]

export default function QuestsPage() {
  const { quests } = useGame()
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    const base = filter === 'all' ? quests : quests.filter((q) => q.category === filter)
    return [...base].sort((a, b) => Number(a.completed) - Number(b.completed))
  }, [quests, filter])

  return (
    <>
      <PageHeader
        eyebrow="Quest Board"
        title="All Quests"
        subtitle="Every challenge you've taken on. Filter by category and clear them to earn rewards."
        action={
          <Button
            onClick={() => setModalOpen(true)}
            className="h-11 gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            New Quest
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterChip>
        {categories.map((c) => {
          const Icon = categoryMeta[c].icon
          return (
            <FilterChip
              key={c}
              active={filter === c}
              onClick={() => setFilter(c)}
            >
              <Icon className="size-3.5" />
              {categoryMeta[c].label}
            </FilterChip>
          )
        })}
      </div>

      <motion.div layout className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <QuestCard quest={quest} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="glass grid place-items-center rounded-2xl p-12 text-center">
          <p className="font-display font-semibold">No quests here yet</p>
          <p className="text-sm text-muted-foreground">
            Add a quest in this category to get started.
          </p>
        </div>
      )}

      <CreateQuestModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
        active
          ? 'border-primary/50 bg-primary/15 text-foreground'
          : 'border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
