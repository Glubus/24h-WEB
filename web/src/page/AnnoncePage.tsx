import type { Page } from '../types/page'
import { SmallCardAccount } from "../components/SmallCardAccount.tsx";
import { useAnnonce } from '../hooks/useAnnonce'
import { useUser } from '../hooks/useUser'

type AnnoncePageProps = {
  onNavigate: (page: Page) => void
  annonceId: number | null
}

export function AnnoncePage({ onNavigate, annonceId }: AnnoncePageProps) {
  const { annonce, loading, error } = useAnnonce(annonceId)
  const { user: author, loading: authorLoading } = useUser(annonce?.author ?? null)

  if (annonceId === null) {
    return (
        <div className="mt-10">
          <p>Aucune annonce sélectionnée.</p>
          <button className="btn btn-primary mt-4" onClick={() => onNavigate('home')}>Retour à l'accueil</button>
        </div>
    )
  }

  if (loading) {
    return (
        <div className="mt-10 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
    )
  }

  if (error || !annonce) {
    return (
        <div className="mt-10">
          <p className="text-error">Erreur lors du chargement de l'annonce.</p>
        </div>
    )
  }

  const firstCategory = annonce.categories[0]

  return (
      <div className="mt-1">
          <div className="breadcrumbs text-sm">
              <ul>
                  <li><a onClick={() => onNavigate('home')}>Home</a></li>
                  {firstCategory && <li><a>{firstCategory}</a></li>}
                  <li>{annonce.title}</li>
              </ul>
          </div>
          <div className="flex gap-6 mt-10">
              <div className="flex-1">
                  <img
                      className="rounded-2xl w-full h-full object-cover"
                      src={annonce.imagePath ?? 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'}
                      alt={annonce.title}
                  />
              </div>
              <div className="w-[500px] shrink-0">
                  <SmallCardAccount
                      username={author?.username}
                      rating={author?.rating ?? null}
                      loading={authorLoading}
                  />
                  <h2 className="text-2xl font-bold mt-10">{annonce.title}</h2>
                  <p className="mt-2 whitespace-pre-line">{annonce.description}</p>
                  {annonce.city && <p className="mt-4 text-sm opacity-70">{annonce.city}</p>}
              </div>
          </div>

          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-base-200 flex items-center gap-5 pt-3 pb-3 pl-7 pr-7 rounded-lg shadow">
              <h2 className="text-2xl font-bold">{annonce.price}€</h2>
              <button className="btn btn-primary">Acheter</button>
          </div>
      </div>

  )
}