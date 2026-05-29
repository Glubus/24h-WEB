import { Car, Dumbbell, Home, Laptop, Tag } from 'lucide-react'
import type { ComponentType } from 'react'
import type { AnnonceCategory } from '../services/api'
import { categoryLabel } from '../utils/categoryLabels'

type CategoryDisplayProps = {
  category: AnnonceCategory | string
  className?: string
  iconClassName?: string
}

const categoryIcons: Partial<Record<AnnonceCategory, ComponentType<{ className?: string }>>> = {
  car: Car,
  electronic: Laptop,
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
