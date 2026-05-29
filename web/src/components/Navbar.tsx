import type { Page } from '../types/page'
import { useCategories } from '../hooks/useCategories'

type NavbarProps = {
  onNavigate: (page: Page) => void
  onNavigateCategory: (category: string) => void
}

export function Navbar({ onNavigate, onNavigateCategory }: NavbarProps) {
  const { categories } = useCategories()

  return (
    <div className="navbar bg-base-100 border-b border-base-300 flex-col items-stretch px-6 md:px-12 lg:px-24 sticky top-0 z-50">
      <div className="w-full flex pb-4">
        <div className="flex-1">
          <button
              type="button"
              className="btn btn-ghost text-xl"
              onClick={() => onNavigate('home')}
          >
            LeBon
          </button>
          <input className="input" placeholder="Rechercher une annonce"/>
        </div>
        <div className="flex gap-2">
          <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onNavigate('home')}
          >
            Découvrir
          </button>
          <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('login')}
          >
            Connexion
          </button>
        </div>
      </div>
      <div className="w-full">
        {categories.map(category => (
          <button
            key={category}
            className="btn btn-sm btn-ghost"
            onClick={() => onNavigateCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
