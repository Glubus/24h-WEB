import { SmallCardAnnonce } from "./SmallCardAnnonce.tsx";
import { useAnnonces } from '../hooks/useAnnonces'
import type { AnnonceCategory, User } from '../services/api'
import { CategoryDisplay } from './CategoryDisplay'

type CategorySmallAnnonceCardProps = {
    category: AnnonceCategory
    currentUser: User | null
    onNavigateAnnonce: (id: number) => void
}

export function CategorySmallAnnonceCard({ category, currentUser, onNavigateAnnonce }: CategorySmallAnnonceCardProps) {
    const { annonces, loading, error } = useAnnonces({ categories: category, masked: false, sold: false })
    const visibleAnnonces = annonces.filter((annonce) => !annonce.sold)

    if (!loading && !error && visibleAnnonces.length === 0) {
        return null
    }

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">
                <CategoryDisplay category={category} iconClassName="h-5 w-5" />
            </h2>
            {loading && <span className="loading loading-spinner loading-sm" />}
            {error && <p className="text-error text-sm">Erreur de chargement.</p>}
            <div className="carousel w-full gap-7">
                {visibleAnnonces.map(annonce => (
                    <div className="carousel-item" key={annonce.id}>
                        <SmallCardAnnonce
                            author={annonce.author}
                            createdAt={annonce.createdAt}
                            currentUserId={currentUser?.id}
	                            favorites={annonce.favorites}
	                            id={annonce.id}
                            masked={annonce.masked}
	                            title={annonce.title}
	                            price={annonce.price}
	                            images={annonce.images}
                            sold={annonce.sold}
	                            city={annonce.city}
                            onClick={() => onNavigateAnnonce(annonce.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
