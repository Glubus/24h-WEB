import type { Page } from '../types/page'

type NavbarProps = {
  onNavigate: (page: Page) => void
}

export function Navbar({ onNavigate }: NavbarProps) {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4">
      <div className="flex-1">
        <button
          type="button"
          className="btn btn-ghost text-xl"
          onClick={() => onNavigate('home')}
        >
          24h Web
        </button>
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
          Login
        </button>
      </div>
    </div>
  )
}
