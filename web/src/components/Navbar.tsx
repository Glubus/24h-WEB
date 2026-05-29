import type { Page } from '../types/page'
import { SearchBar } from './SearchBar.tsx'

type NavbarProps = {
  onNavigate: (page: Page) => void
  onNavigateCategory: (category: string) => void
  onSearch: (query: string) => void
}

export function Navbar({ onNavigate, onNavigateCategory, onSearch }: NavbarProps) {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 flex-col items-stretch px-6 md:px-12 lg:px-24 sticky top-0 z-50">
      <div className="w-full flex pb-4 justify-between">
        <div>
          <button
              type="button"
              className="btn btn-ghost text-xl"
              onClick={() => onNavigate('home')}
          >
            LeBon
          </button>
        </div>

        <SearchBar onSearch={onSearch} />

        <div>
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
        <button className="btn btn-sm btn-ghost" onClick={() => onNavigateCategory('Technologie')}>Technologie</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onNavigateCategory('Voiture')}>Voiture</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onNavigateCategory('Cuisine')}>Cuisine</button>
        <button className="btn btn-sm btn-ghost" onClick={() => onNavigateCategory('Livre')}>Livre</button>
      </div>
    </div>
  )
}
