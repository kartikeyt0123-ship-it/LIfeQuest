import {
  Flame,
  ScrollText,
  ShoppingBag,
  Swords,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: Swords },
  { label: 'Quests', href: '/quests', icon: ScrollText },
  { label: 'Habits', href: '/habits', icon: Flame },
  { label: 'Achievements', href: '/achievements', icon: Trophy },
  { label: 'Reward Shop', href: '/shop', icon: ShoppingBag },
  { label: 'Character', href: '/character', icon: UserRound },
]
