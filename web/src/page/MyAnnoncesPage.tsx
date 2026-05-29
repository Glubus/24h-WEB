import { SmallCardAnnonce } from '../components/SmallCardAnnonce'
import { useAnnonces } from '../hooks/useAnnonces'
import type { User } from '../services/api'
import type { Page } from '../types/page'

type MyAnnoncesPageProps = {
  currentUser: User | null
  onNavigate: (page: Page) => void
  onNavigateAnnonce: (id: number) => void
}

export function MyAnnoncesPage({ currentUser, onNavigate, onNavigateAnnonce }: MyAnnoncesPageProps) {
  const { annonces, loading, error } = useAnnonces()
  const userId = currentUser?.id
  const userAnnonces = userId === undefined ? [] : annonces.filter((annonce) => annonceAuthorId(annonce.author) === userId)

  if (currentUser === null) {
    return (
      <main className="mx-auto max-w-xl py-16">
        <div className="rounded-lg border border-base-300 bg-base-100 p-6">
          <h1 className="text-2xl font-bold">Mes annonces</h1>
          <p className="mt-2 text-base-content/70">Connectez-vous pour voir vos annonces.</p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => onNavigate('login')}>
            Connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes annonces</h1>
          <p className="text-sm text-base-content/60">Toutes vos annonces, y compris vendues ou masquées.</p>
        </div>
        {loading ? <span className="loading loading-spinner loading-sm" /> : null}
      </div>

      {error ? <p className="mb-4 text-sm text-error">Erreur lors du chargement des annonces.</p> : null}

      {userAnnonces.length === 0 && !loading ? (
        <div className="rounded-lg border border-base-300 bg-base-100 p-6">
          <p>Aucune annonce pour le moment.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => onNavigate('createAnnonce')}>
            Mettre une annonce
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {userAnnonces.map((annonce) => (
            <SmallCardAnnonce
              key={annonce.id}
              author={annonce.author}
              city={annonce.city}
              createdAt={annonce.createdAt}
              currentUserId={currentUser.id}
              favorites={annonce.favorites}
              id={annonce.id}
              images={annonce.images}
              masked={annonce.masked}
              onClick={() => onNavigateAnnonce(annonce.id)}
              price={annonce.price}
              sold={annonce.sold}
              title={annonce.title}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function annonceAuthorId(author: User | string) {
  if (typeof author !== 'string') {
    return author.id
  }

  const match = author.match(/\/users\/(?<id>\d+)$/)

  return match?.groups?.id === undefined ? undefined : Number(match.groups.id)
}
