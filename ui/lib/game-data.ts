import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BookOpen,
  Brain,
  Coffee,
  Dumbbell,
  Film,
  Flame,
  Gamepad2,
  GraduationCap,
  Heart,
  Pizza,
  Sparkles,
  Sword,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic'

export type QuestCategory =
  | 'study'
  | 'fitness'
  | 'reading'
  | 'work'
  | 'mindfulness'
  | 'creative'

export const categoryMeta: Record<
  QuestCategory,
  { label: string; icon: LucideIcon }
> = {
  study: { label: 'Study', icon: GraduationCap },
  fitness: { label: 'Fitness', icon: Dumbbell },
  reading: { label: 'Reading', icon: BookOpen },
  work: { label: 'Work', icon: Zap },
  mindfulness: { label: 'Mindfulness', icon: Brain },
  creative: { label: 'Creative', icon: Sparkles },
}

export const difficultyMeta: Record<
  Difficulty,
  { label: string; color: string; dots: number }
> = {
  easy: { label: 'Easy', color: 'var(--success)', dots: 1 },
  medium: { label: 'Medium', color: 'var(--electric)', dots: 2 },
  hard: { label: 'Hard', color: 'var(--violet)', dots: 3 },
  epic: { label: 'Epic', color: 'var(--gold)', dots: 4 },
}

export type Quest = {
  id: string
  title: string
  description: string
  category: QuestCategory
  difficulty: Difficulty
  xp: number
  gold: number
  completed: boolean
}

export type Habit = {
  id: string
  name: string
  icon: LucideIcon
  streak: number
  accent: string
  /** last 7 days, index 0 = 6 days ago, index 6 = today */
  week: boolean[]
}

export type Achievement = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  unlocked: boolean
  progress: number
  goal: number
}

export type Reward = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  cost: number
}

export type Stat = {
  name: string
  icon: LucideIcon
  value: number
  accent: string
}

export const initialQuests: Quest[] = [
  {
    id: 'q1',
    title: 'Study DSA',
    description: 'Complete 2 hours of DSA practice',
    category: 'study',
    difficulty: 'hard',
    xp: 150,
    gold: 60,
    completed: false,
  },
  {
    id: 'q2',
    title: 'Morning Workout',
    description: "Complete today's workout session",
    category: 'fitness',
    difficulty: 'medium',
    xp: 100,
    gold: 40,
    completed: false,
  },
  {
    id: 'q3',
    title: 'Read 20 Pages',
    description: 'Read 20 pages of your current book',
    category: 'reading',
    difficulty: 'easy',
    xp: 70,
    gold: 25,
    completed: false,
  },
  {
    id: 'q4',
    title: 'Ship a Feature',
    description: 'Finish and deploy one product feature',
    category: 'work',
    difficulty: 'epic',
    xp: 220,
    gold: 90,
    completed: false,
  },
  {
    id: 'q5',
    title: 'Meditate',
    description: '10 minutes of focused breathing',
    category: 'mindfulness',
    difficulty: 'easy',
    xp: 60,
    gold: 20,
    completed: true,
  },
]

const w = (pattern: number[]) => pattern.map((n) => n === 1)

export const initialHabits: Habit[] = [
  {
    id: 'h1',
    name: 'Workout',
    icon: Dumbbell,
    streak: 12,
    accent: 'var(--violet)',
    week: w([1, 1, 1, 0, 1, 1, 1]),
  },
  {
    id: 'h2',
    name: 'Read',
    icon: BookOpen,
    streak: 8,
    accent: 'var(--electric)',
    week: w([1, 1, 0, 1, 1, 1, 0]),
  },
  {
    id: 'h3',
    name: 'Coding',
    icon: Zap,
    streak: 21,
    accent: 'var(--gold)',
    week: w([1, 1, 1, 1, 1, 1, 1]),
  },
  {
    id: 'h4',
    name: 'Meditation',
    icon: Brain,
    streak: 5,
    accent: 'var(--success)',
    week: w([0, 1, 1, 0, 1, 1, 0]),
  },
]

export const initialAchievements: Achievement[] = [
  {
    id: 'a1',
    title: 'First Quest',
    description: 'Complete your first quest',
    icon: Sword,
    unlocked: true,
    progress: 1,
    goal: 1,
  },
  {
    id: 'a2',
    title: 'Unstoppable',
    description: 'Reach a 7 day streak',
    icon: Flame,
    unlocked: true,
    progress: 12,
    goal: 7,
  },
  {
    id: 'a3',
    title: 'Quest Master',
    description: 'Complete 100 quests',
    icon: Trophy,
    unlocked: false,
    progress: 63,
    goal: 100,
  },
  {
    id: 'a4',
    title: 'Scholar',
    description: 'Study for 50 hours',
    icon: GraduationCap,
    unlocked: false,
    progress: 34,
    goal: 50,
  },
  {
    id: 'a5',
    title: 'Gold Hoarder',
    description: 'Earn 10,000 Gold',
    icon: Award,
    unlocked: false,
    progress: 6480,
    goal: 10000,
  },
  {
    id: 'a6',
    title: 'Zen Mind',
    description: 'Meditate 30 days total',
    icon: Brain,
    unlocked: false,
    progress: 18,
    goal: 30,
  },
]

export const rewards: Reward[] = [
  {
    id: 'r1',
    name: 'Coffee Break',
    description: 'A well-earned cup of your favorite brew',
    icon: Coffee,
    cost: 100,
  },
  {
    id: 'r2',
    name: 'Movie Night',
    description: 'Stream a film with zero guilt',
    icon: Film,
    cost: 300,
  },
  {
    id: 'r3',
    name: 'Gaming Session',
    description: 'Two hours of pure play',
    icon: Gamepad2,
    cost: 500,
  },
  {
    id: 'r4',
    name: 'Favorite Meal',
    description: 'Order the thing you actually crave',
    icon: Pizza,
    cost: 800,
  },
  {
    id: 'r5',
    name: 'Cinematic Evening',
    description: 'Dinner and a night out on the town',
    icon: Sparkles,
    cost: 1000,
  },
  {
    id: 'r6',
    name: 'Rest Day',
    description: 'A full guilt-free day off, fully unlocked',
    icon: Heart,
    cost: 1500,
  },
]

export const initialStats: Stat[] = [
  { name: 'Strength', icon: Sword, value: 80, accent: 'var(--violet)' },
  { name: 'Intelligence', icon: Brain, value: 70, accent: 'var(--electric)' },
  { name: 'Focus', icon: Target, value: 82, accent: 'var(--gold)' },
  { name: 'Discipline', icon: Flame, value: 60, accent: 'var(--success)' },
]

export function xpForLevel(level: number) {
  return 1000 + level * 250
}
