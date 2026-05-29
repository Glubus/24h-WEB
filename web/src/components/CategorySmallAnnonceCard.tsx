import { SmallCardAnnonce } from "./SmallCardAnnonce.tsx";
import { useAnnonces } from '../hooks/useAnnonces'
import type { AnnonceCategory } from '../services/api'

type CategorySmallAnnonceCardProps = {
    category: AnnonceCategory
    onNavigateAnnonce: (id: number) => void
}

export function CategorySmallAnnonceCard({ category, onNavigateAnnonce }: CategorySmallAnnonceCardProps) {
    const { annonces, loading, error } = useAnnonces(category)

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
            {loading && <span className="loading loading-spinner loading-sm" />}
            {error && <p className="text-error text-sm">Erreur de chargement.</p>}
            <div className="carousel w-full gap-7">
                {annonces.map(annonce => (
                    <div className="carousel-item" key={annonce.id}>
                        <SmallCardAnnonce
                            title={annonce.title}
                            price={annonce.price}
                            imagePath={annonce.imagePath}
                            city={annonce.city}
                            onClick={() => onNavigateAnnonce(annonce.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}