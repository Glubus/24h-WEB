import { SmallCardAnnonce } from "./SmallCardAnnonce.tsx";
import { useAnnonces } from "../hooks/useAnnonces";
import type { AnnonceCategory, User } from "../services/api";

type CategorySmallAnnonceCardProps = {
  category: AnnonceCategory;
  currentUser: User | null;
  onNavigateAnnonce: (id: number) => void;
};

export function CategorySmallAnnonceCard({
  category,
  currentUser,
  onNavigateAnnonce,
}: CategorySmallAnnonceCardProps) {
  const { annonces, loading, error } = useAnnonces(category);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
      {loading && <span className="loading loading-spinner loading-sm" />}
      {error && <p className="text-error text-sm">Erreur de chargement.</p>}
      <div className="carousel w-full gap-7">
        {annonces.map((annonce) => (
          <div className="carousel-item" key={annonce.id}>
            <SmallCardAnnonce
              author={annonce.author}
              createdAt={annonce.createdAt}
              currentUserId={currentUser?.id}
              favorites={annonce.favorites}
              id={annonce.id}
              title={annonce.title}
              price={annonce.price}
              images={annonce.images}
              city={annonce.city}
              onClick={() => onNavigateAnnonce(annonce.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
