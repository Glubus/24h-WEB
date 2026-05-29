import type { Page } from '../types/page'
import { CategorySmallAnnonceCard } from '../components/CategorySmallAnnonceCard.tsx'
import { Map } from '../components/Map'
import { useAnnonces } from '../hooks/useAnnonces'
import type { User } from '../services/api'

type HomePageProps = {
  currentUser: User | null
  onNavigate: (page: Page) => void
  onNavigateAnnonce: (id: number) => void
}

export function HomePage({ currentUser, onNavigateAnnonce }: HomePageProps) {
  const { annonces, loading, error } = useAnnonces()
  const coordinates = annonces.map((annonce) => ({
    id: annonce.id,
    latitude: annonce.latitude,
    longitude: annonce.longitude,
    label: (
      <div className="min-w-36">
        <p className="font-semibold">{annonce.title}</p>
        <p>{annonce.price}€</p>
        {annonce.city ? <p className="text-xs opacity-70">{annonce.city}</p> : null}
      </div>
    ),
  }))

  return (
    <div className="py-10">
      <section className="bg-base-100">
        <div className="flex flex-col gap-10">
          <CategorySmallAnnonceCard category="car" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
          <CategorySmallAnnonceCard category="electronic" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
          <CategorySmallAnnonceCard category="sport" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
          <CategorySmallAnnonceCard category="home" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Toutes les annonces</h1>
            <p className="text-sm text-base-content/60">Carte des annonces disponibles.</p>
          </div>
          {loading ? <span className="loading loading-spinner loading-sm" /> : null}
        </div>

        {error ? <p className="mb-4 text-sm text-error">Erreur lors du chargement des annonces.</p> : null}

        <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
          <Map coordinates={coordinates} height="min(72vh, 760px)" />
        </div>
      </section>
    </div>
  )
}
