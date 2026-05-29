import { Heart } from 'lucide-react'
import type { Page } from '../types/page'
import { CategorySmallAnnonceCard } from '../components/CategorySmallAnnonceCard.tsx'
import { Map as ListingMap } from '../components/Map'
import { useAnnonces } from '../hooks/useAnnonces'
import { SmallCardAnnonce } from '../components/SmallCardAnnonce'
import type { AnnonceListItem, User } from '../services/api'
import type { Page } from "../types/page";
import { CategorySmallAnnonceCard } from "../components/CategorySmallAnnonceCard.tsx";
import { Map } from "../components/Map";
import { useAnnonces } from "../hooks/useAnnonces";
import type { User } from "../services/api";

type HomePageProps = {
  currentUser: User | null;
  onNavigate: (page: Page) => void;
  onNavigateAnnonce: (id: number) => void;
};

export function HomePage({ currentUser, onNavigateAnnonce }: HomePageProps) {
  const { annonces, loading, error } = useAnnonces({ masked: false })
  const currentUserId = currentUser?.id
  const availableAnnonces = annonces.filter((annonce) => !annonce.sold)
  const favoriteAnnonces = currentUserId === undefined
    ? []
    : availableAnnonces.filter((annonce) => relationContainsUser(annonce.favorites, currentUserId))
  const bestSellerAnnonces = bestSellerListings(availableAnnonces)
  const coordinates = availableAnnonces.map((annonce) => ({
  const { annonces, loading, error } = useAnnonces();
  const coordinates = annonces.map((annonce) => ({
    id: annonce.id,
    latitude: annonce.latitude,
    longitude: annonce.longitude,
    label: (
      <div className="min-w-36">
        <p className="font-semibold">{annonce.title}</p>
        <p>{annonce.price}€</p>
        {annonce.city ? (
          <p className="text-xs opacity-70">{annonce.city}</p>
        ) : null}
      </div>
    ),
  }));

  return (
    <div className="py-10">
      <section className="bg-base-100">
        <div className="flex flex-col gap-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-semibold">Meilleurs vendeurs</h2>
              {loading ? <span className="loading loading-spinner loading-sm" /> : null}
            </div>
            {loading ? (
              <div className="flex h-60 items-center justify-center rounded-lg border border-base-300 bg-base-100">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : bestSellerAnnonces.length > 0 ? (
              <div className="carousel w-full gap-7">
                {bestSellerAnnonces.map((annonce) => (
                  <div className="carousel-item" key={annonce.id}>
                    <SmallCardAnnonce
                      author={annonce.author}
                      city={annonce.city}
                      createdAt={annonce.createdAt}
                      currentUserId={currentUser?.id}
	                      favorites={annonce.favorites}
	                      id={annonce.id}
	                      images={annonce.images}
                      masked={annonce.masked}
	                      onClick={() => onNavigateAnnonce(annonce.id)}
	                      price={annonce.price}
                      sold={annonce.sold}
	                      title={annonce.title}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-base-300 bg-base-100 p-6 text-sm text-base-content/60">
                Aucun meilleur vendeur pour le moment.
              </div>
            )}
          </div>
          {currentUserId === undefined ? null : (
            <div>
              <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-semibold">
                <Heart className="h-5 w-5 text-secondary" />
                <span>Mes favoris</span>
              </h2>
              {favoriteAnnonces.length > 0 ? (
                <div className="carousel w-full gap-7">
                  {favoriteAnnonces.map((annonce) => (
                    <div className="carousel-item" key={annonce.id}>
                      <SmallCardAnnonce
                        author={annonce.author}
                        city={annonce.city}
                        createdAt={annonce.createdAt}
                        currentUserId={currentUserId}
                        favorites={annonce.favorites}
                        id={annonce.id}
                        images={annonce.images}
                        masked={annonce.masked}
                        onClick={() => onNavigateAnnonce(annonce.id)}
                        price={annonce.price}
                        sold={annonce.sold}
                        title={annonce.title}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-base-300 bg-base-100 p-6 text-sm text-base-content/60">
                  Aucune annonce en favori pour le moment.
                </div>
              )}
            </div>
          )}
          <CategorySmallAnnonceCard category="car" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
          <CategorySmallAnnonceCard category="electronic" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
          <CategorySmallAnnonceCard category="sport" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
          <CategorySmallAnnonceCard category="home" currentUser={currentUser} onNavigateAnnonce={onNavigateAnnonce} />
          <CategorySmallAnnonceCard
            category="car"
            currentUser={currentUser}
            onNavigateAnnonce={onNavigateAnnonce}
          />
          <CategorySmallAnnonceCard
            category="electronic"
            currentUser={currentUser}
            onNavigateAnnonce={onNavigateAnnonce}
          />
          <CategorySmallAnnonceCard
            category="sport"
            currentUser={currentUser}
            onNavigateAnnonce={onNavigateAnnonce}
          />
          <CategorySmallAnnonceCard
            category="home"
            currentUser={currentUser}
            onNavigateAnnonce={onNavigateAnnonce}
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Toutes les annonces</h1>
            <p className="text-sm text-base-content/60">
              Carte des annonces disponibles.
            </p>
          </div>
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : null}
        </div>

        {error ? (
          <p className="mb-4 text-sm text-error">
            Erreur lors du chargement des annonces.
          </p>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
          <ListingMap coordinates={coordinates} height="min(72vh, 760px)" />
        </div>
      </section>
    </div>
  );
}

function bestSellerListings(annonces: AnnonceListItem[]) {
  const sellerScores = new Map<number, { rating: number; saleCount: number }>()

  for (const annonce of annonces) {
    if (typeof annonce.author === 'string' || annonce.author.id === undefined) {
      continue
    }

    const currentScore = sellerScores.get(annonce.author.id) ?? { rating: 0, saleCount: 0 }
    sellerScores.set(annonce.author.id, {
      rating: Math.max(currentScore.rating, annonce.author.rating ?? 0),
      saleCount: Math.max(currentScore.saleCount, annonce.author.successfulSaleCount ?? 0),
    })
  }

  const topSellerIds = new Set(
    [...sellerScores.entries()]
      .sort(([, left], [, right]) => right.rating - left.rating || right.saleCount - left.saleCount)
      .slice(0, 10)
      .map(([sellerId]) => sellerId),
  )

  return annonces.filter((annonce) => {
    if (typeof annonce.author === 'string' || annonce.author.id === undefined) {
      return false
    }

    return topSellerIds.has(annonce.author.id)
  })
}

function relationContainsUser(users: AnnonceListItem['favorites'], userId: number) {
  return users?.some((user) => {
    if (typeof user === 'string') {
      return user.endsWith(`/users/${userId}`)
    }

    return user.id === userId
  }) ?? false
}
