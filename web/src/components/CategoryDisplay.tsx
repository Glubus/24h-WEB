import { Car, Dumbbell, Heart, Home, Laptop, Tag } from 'lucide-react'
import type { ComponentType } from 'react'
import type { AnnonceCategory } from '../services/api'
import { categoryLabel, type DisplayCategory } from '../utils/categoryLabels'

type CategoryDisplayProps = {
  category: AnnonceCategory | string
  className?: string
  iconClassName?: string
}

const categoryIcons: Partial<Record<DisplayCategory, ComponentType<{ className?: string }>>> = {
  car: Car,
  electronic: Laptop,
  favorites: Heart,
  sport: Dumbbell,
  home: Home,
}

export function CategoryDisplay({ category, className = '', iconClassName = 'h-4 w-4' }: CategoryDisplayProps) {
  const Icon = categoryIcons[category as AnnonceCategory] ?? Tag

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icon className={iconClassName} />
      <span>{categoryLabel(category)}</span>
    </span>
  )
}
