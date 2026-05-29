import type { Page } from '../types/page'
import { useAnnonces } from '../hooks/useAnnonces'
import { SmallCardAnnonce } from '../components/SmallCardAnnonce.tsx'

type CategoryPageProps = {
    onNavigate: (page: Page) => void
    category: string
    onNavigateAnnonce: (id: number) => void
}

export function CategoryPage({ category, onNavigateAnnonce }: CategoryPageProps) {
    const { annonces, loading, error } = useAnnonces(category)

    return (
        <div className="mt-6">
            <h1 className="text-3xl font-bold mb-6">{category}</h1>
            {loading && <span className="loading loading-spinner loading-lg" />}
            {error && <p className="text-error">Erreur lors du chargement des annonces.</p>}
            <div className="flex flex-wrap gap-4">
                {annonces.map(annonce => (
                    <SmallCardAnnonce
                        key={annonce.id}
                        title={annonce.title}
                        price={annonce.price}
                        imagePath={annonce.imagePath}
                        city={annonce.city}
                        onClick={() => onNavigateAnnonce(annonce.id)}
                    />
                ))}
            </div>
        </div>
    )
}
