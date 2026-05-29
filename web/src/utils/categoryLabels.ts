import type { AnnonceCategory } from '../services/api'

export type DisplayCategory = AnnonceCategory | 'favorites'

export const annonceCategoryLabels: Record<AnnonceCategory, string> = {
  car: 'Voiture',
  electronic: 'Électronique',
  sport: 'Sport',
  home: 'Maison',
}

export const displayCategoryLabels: Record<DisplayCategory, string> = {
  ...annonceCategoryLabels,
  favorites: 'Mes favoris',
}

export const annonceCategories: Array<{ label: string; value: AnnonceCategory }> = Object.entries(
  annonceCategoryLabels,
).map(([value, label]) => ({
  label,
  value: value as AnnonceCategory,
}))

export function categoryLabel(category: AnnonceCategory | string) {
  return displayCategoryLabels[category as DisplayCategory] ?? category
}
