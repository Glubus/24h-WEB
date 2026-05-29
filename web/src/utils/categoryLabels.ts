import type { AnnonceCategory } from '../services/api'

export const annonceCategoryLabels: Record<AnnonceCategory, string> = {
  car: 'Voiture',
  electronic: 'Électronique',
  sport: 'Sport',
  home: 'Maison',
}

export const annonceCategories: Array<{ label: string; value: AnnonceCategory }> = Object.entries(
  annonceCategoryLabels,
).map(([value, label]) => ({
  label,
  value: value as AnnonceCategory,
}))

export function categoryLabel(category: AnnonceCategory | string) {
  return annonceCategoryLabels[category as AnnonceCategory] ?? category
}
