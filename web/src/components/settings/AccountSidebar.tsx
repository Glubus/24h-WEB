import type { ChangeEvent } from 'react'
import type { User } from '../../services/api'

export type AccountSection = 'dashboard' | 'settings'

type AccountSidebarProps = {
  activeSection: AccountSection
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSectionChange: (section: AccountSection) => void
  profileImage: string | null
  user: User
}

export function AccountSidebar({
  activeSection,
  onImageChange,
  onSectionChange,
  profileImage,
  user,
}: AccountSidebarProps) {
  return (
    <aside className="rounded-lg border border-base-300 bg-base-100 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="avatar">
          <div className="h-28 w-28 rounded-full bg-base-200">
            {profileImage === null ? (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                {user.username.charAt(0).toUpperCase()}
              </div>
            ) : (
              <img src={profileImage} alt={user.username} />
            )}
          </div>
        </div>
        <label className="btn btn-outline btn-sm mt-4">
          Changer l'image
          <input accept="image/*" className="hidden" onChange={onImageChange} type="file" />
        </label>
        <h1 className="mt-4 text-2xl font-bold">{user.username}</h1>
        <p className="text-sm text-base-content/60">{user.email}</p>
      </div>

      <div className="divider" />
      <ul className="menu gap-1">
        <li>
          <button
            className={activeSection === 'dashboard' ? 'active' : ''}
            type="button"
            onClick={() => onSectionChange('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button
            className={activeSection === 'settings' ? 'active' : ''}
            type="button"
            onClick={() => onSectionChange('settings')}
          >
            Paramètres
          </button>
        </li>
      </ul>
    </aside>
  )
}
