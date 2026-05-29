import { useEffect, useState } from 'react'
import type { Page } from '../types/page'
import { api } from '../services/api'
import type { AnnonceListItem } from '../services/api'

export type SearchResultPageProps = {
    onNavigate: (page: Page) => void
    query?: string
    category?: string
}

export function SearchResultPage({ onNavigate, query, category }: SearchResultPageProps) {
    const [results, setResults] = useState<AnnonceListItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const normalizedQuery = (query ?? category ?? '').trim()

    useEffect(() => {
        if (normalizedQuery.length === 0) {
            return
        }

        let isActive = true

        async function loadResults() {
            setIsLoading(true)
            setError(null)

            try {
                const response = await api.listAnnonces({
                    title: normalizedQuery,
                })

                if (isActive) {
                    setResults(response.member)
                }
            } catch (caughtError) {
                if (isActive) {
                    setResults([])
                    setError(caughtError instanceof Error ? caughtError.message : 'Une erreur est survenue pendant la recherche.')
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        void loadResults()

        return () => {
            isActive = false
        }
    }, [normalizedQuery])

    return (
        <div className="mt-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Résultats pour “{normalizedQuery}”</h1>
                    <p className="text-base-content/70">
                        {isLoading ? 'Recherche en cours…' : `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`}
                    </p>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => onNavigate('home')}>
                    Retour à l’accueil
                </button>
            </div>

            {error !== null ? (
                <div className="alert alert-error mb-6">
                    <span>{error}</span>
                </div>
            ) : null}

            {!isLoading && error === null && results.length === 0 ? (
                <div className="rounded-box border border-base-300 bg-base-100 p-6 text-base-content/70">
                    Aucun résultat trouvé. Essaie un autre mot-clé.
                </div>
            ) : null}

            <div className="flex flex-wrap gap-4">
                {results.map((annonce) => (
                    <div key={annonce.id} className="card bg-base-200 w-55">
                        <figure>
                            <div className="relative">
                                <img
                                    src={annonce.imagePath ?? 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'}
                                    alt={annonce.title}
                                />
                                <div className="badge absolute top-2 left-2 badge-ghost badge-lg">{annonce.price}</div>
                            </div>
                        </figure>
                        <div className="card-body p-2 text-left mb-4">
                            <h2 className="card-title card-sm">{annonce.title}</h2>
                            <p>{annonce.city ?? 'Ville non renseignée'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
