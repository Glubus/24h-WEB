import type { Page } from '../types/page'
import { SearchBar } from './SearchBar.tsx'
import type { User } from '../services/api'
import { userPictureUrl } from '../services/api/assets'
import { useCategories } from '../hooks/useCategories'
import { formatUsername } from '../utils/formatUsername'

type NavbarProps = {
  currentUser: User | null
  onLogout: () => void
  onNavigate: (page: Page) => void
  onNavigateCategory: (category: string) => void
  onSearch: (query: string) => void
}

export function Navbar({ currentUser, onLogout, onNavigate, onNavigateCategory, onSearch  }: NavbarProps) {
  const initial = currentUser?.username.charAt(0).toUpperCase() ?? '?'
  const displayUsername = formatUsername(currentUser?.username)
  const profileImageUrl = currentUser?.id === undefined ? null : userPictureUrl(currentUser.id)
  const { categories } = useCategories()

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
              onClick={() => onNavigate(currentUser === null ? 'login' : 'createAnnonce')}
          >
            Mettre une annonce
          </button>
          {currentUser === null ? null : (
            <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onNavigate('chat')}
            >
              Chat
            </button>
          )}
          {currentUser === null ? (
            <>
              <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onNavigate('register')}
              >
                Inscription
              </button>
              <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onNavigate('login')}
              >
                Connexion
              </button>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <button type="button" className="btn btn-ghost gap-2" tabIndex={0}>
                <div className={`avatar ${profileImageUrl === null ? 'placeholder' : ''}`}>
                  <div className="w-9 rounded-full bg-primary text-primary-content">
                    {profileImageUrl === null ? <span>{initial}</span> : <img src={profileImageUrl} alt={displayUsername} />}
                  </div>
                </div>
                <span className="hidden max-w-32 truncate md:inline">{displayUsername}</span>
              </button>
              <ul
                className="menu dropdown-content z-[1] mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow"
                tabIndex={0}
              >
                <li>
                  <button type="button" onClick={() => onNavigate('settingsUser')}>
                    Paramètres
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onLogout}>
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          )}
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
