import type { Page } from "../types/page";
import { Map } from "../components/Map";
import { SmallCardAccount } from "../components/SmallCardAccount.tsx";
import { api } from "../services/api";
import { annonceImageUrl } from "../services/api/assets";
import type { Annonce, User } from "../services/api";
import { useAnnonce } from "../hooks/useAnnonce";
import { useUser } from "../hooks/useUser";
import { useState } from "react";

type AnnoncePageProps = {
  currentUser: User | null;
  onNavigate: (page: Page) => void;
  onNavigateChat: (conversationId: number) => void;
  annonceId: number | null;
};

export function AnnoncePage({
  currentUser,
  onNavigate,
  onNavigateChat,
  annonceId,
}: AnnoncePageProps) {
  const { annonce, loading, error } = useAnnonce(annonceId);
  const { user: author, loading: authorLoading } = useUser(
    annonce?.author ?? null,
  );
  const [chatError, setChatError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [favoriteOverride, setFavoriteOverride] = useState<Annonce | null>(
    null,
  );
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [sellerRatingOverride, setSellerRatingOverride] = useState<
    number | null
  >(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    annonceId: number | null;
    index: number;
  }>({
    annonceId: null,
    index: 0,
  });

  if (annonceId === null) {
    return (
      <div className="mt-10">
        <p>Aucune annonce sélectionnée.</p>
        <button
          className="btn btn-primary mt-4"
          onClick={() => onNavigate("home")}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-10 flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !annonce) {
    return (
      <div className="mt-10">
        <p className="text-error">Erreur lors du chargement de l'annonce.</p>
      </div>
    );
  }

  const firstCategory = annonce.categories[0];
  const fallbackImageUrl =
    "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";
  const imageUrls =
    annonce.images.length > 0
      ? annonce.images.map((_, index) => annonceImageUrl(annonce.id, index))
      : [fallbackImageUrl];
  const selectedImageIndex =
    selectedImage.annonceId === annonce.id ? selectedImage.index : 0;
  const imageUrl = imageUrls[selectedImageIndex] ?? imageUrls[0];
  const displayAnnonce =
    favoriteOverride?.id === annonce.id ? favoriteOverride : annonce;
  const favoriteCount =
    displayAnnonce.favoriteCount ?? displayAnnonce.favorites?.length ?? 0;
  const coordinates =
    annonce.latitude && annonce.longitude
      ? [
          {
            id: annonce.id,
            latitude: annonce.latitude,
            longitude: annonce.longitude,
            label: annonce.city ?? annonce.title,
          },
        ]
      : [];
  const isAuthor =
    currentUser?.id !== undefined &&
    author?.id !== undefined &&
    currentUser.id === author.id;
  const isFavorite =
    currentUser?.id === undefined
      ? false
      : relationContainsUser(displayAnnonce.favorites, currentUser.id);
  const displayedSellerRating = sellerRatingOverride ?? author?.rating ?? null;

  async function handleStartChat() {
    if (annonce === null || annonce === undefined) {
      return;
    }

    if (currentUser === null) {
      onNavigate("login");
      return;
    }

    setChatError(null);
    setIsStartingChat(true);

    try {
      const conversation = await api.startConversationFromAnnonce(annonce.id);
      await api.createMessage({
        conversation: `/api/conversations/${conversation.id}`,
        content: "Bonjour, je suis intéressé par votre annonce.",
        annonce: `/api/annonces/${annonce.id}`,
      });
      onNavigateChat(conversation.id);
    } catch (startError) {
      setChatError(
        startError instanceof Error
          ? startError.message
          : "Conversation impossible.",
      );
    } finally {
      setIsStartingChat(false);
    }
  }

  async function handleToggleFavorite() {
    if (annonce === null || annonce === undefined) {
      return;
    }

    if (currentUser === null) {
      onNavigate("login");
      return;
    }

    const currentAnnonce: Annonce = annonce;
    setIsTogglingFavorite(true);

    try {
      setFavoriteOverride(await api.toggleAnnonceFavorite(currentAnnonce.id));
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  async function handleRateSeller() {
    if (annonce === null || annonce === undefined) {
      return;
    }

    if (currentUser === null) {
      onNavigate("login");
      return;
    }

    const currentAnnonce: Annonce = annonce;
    setRatingError(null);
    setIsSavingRating(true);

    try {
      const updatedAnnonce = await api.rateAnnonceSeller(
        currentAnnonce.id,
        ratingValue,
      );
      setSellerRatingOverride(ratingValue);
      setFavoriteOverride(updatedAnnonce);
    } catch (rateError) {
      setRatingError(
        rateError instanceof Error ? rateError.message : "Note impossible.",
      );
    } finally {
      setIsSavingRating(false);
    }
  }

  return (
    <div className="mt-1">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <button type="button" onClick={() => onNavigate("home")}>
              Home
            </button>
          </li>
          {firstCategory && (
            <li>
              <a>{firstCategory}</a>
            </li>
          )}
          <li>{annonce.title}</li>
        </ul>
      </div>
      <div className="flex gap-6 mt-10">
        <div className="h-[650px] flex-1">
          <img
            className="rounded-2xl w-full h-full object-cover"
            src={imageUrl}
            alt={annonce.title}
          />
        </div>
        <div className="flex h-[650px] w-[500px] shrink-0 flex-col">
          <SmallCardAccount
            favoriteCount={favoriteCount}
            successfulSaleCount={author?.successfulSaleCount ?? 0}
            userId={author?.id ?? null}
            username={author?.username}
            rating={displayedSellerRating}
            loading={authorLoading}
          />
          <button
            type="button"
            className={`btn mt-4 ${isFavorite ? "btn-secondary" : "btn-outline"}`}
            disabled={isTogglingFavorite}
            onClick={handleToggleFavorite}
          >
            {isTogglingFavorite ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            {isFavorite ? "Retirer des favoris" : "Mettre en favoris"}
          </button>
          <button
            type="button"
            className="btn btn-primary mt-3"
            disabled={isAuthor || isStartingChat}
            onClick={handleStartChat}
          >
            {isStartingChat ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            Chatter avec le vendeur
          </button>
          {chatError === null ? null : (
            <p className="mt-2 text-sm text-error">{chatError}</p>
          )}
          {!isAuthor && currentUser !== null ? (
            <div className="mt-4 rounded-lg border border-base-300 bg-base-100 p-4">
              <p className="text-sm font-semibold">Noter le vendeur</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="rating rating-md">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <input
                      key={value}
                      type="radio"
                      name="seller-rating"
                      className="mask mask-star-2 bg-orange-400"
                      checked={ratingValue === value}
                      onChange={() => setRatingValue(value)}
                      aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={isSavingRating}
                  onClick={handleRateSeller}
                >
                  {isSavingRating ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : null}
                  Valider
                </button>
              </div>
              {ratingError === null ? null : (
                <p className="mt-2 text-sm text-error">{ratingError}</p>
              )}
            </div>
          ) : null}
          <h2 className="text-2xl font-bold mt-10">{annonce.title}</h2>
          <p className="mt-2 whitespace-pre-line">{annonce.description}</p>
          {annonce.city && (
            <p className="mt-4 text-sm opacity-70">{annonce.city}</p>
          )}
          <div className="mt-6 min-h-0 flex-1 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <Map coordinates={coordinates} height="100%" />
          </div>
        </div>
      </div>

      <div className="carousel mt-6 w-full gap-4 rounded-lg bg-base-200 p-4">
        {imageUrls.map((url, index) => (
          <div key={`${url}-${index}`} className="carousel-item">
            <button
              type="button"
              className={`rounded-lg transition ${
                index === selectedImageIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-base-200"
                  : "opacity-40 grayscale hover:opacity-80 hover:grayscale-0"
              }`}
              onClick={() => setSelectedImage({ annonceId: annonce.id, index })}
              aria-label={`Afficher l'image ${index + 1}`}
              aria-pressed={index === selectedImageIndex}
            >
              <img
                className="h-32 w-48 rounded-lg object-cover"
                src={url}
                alt={`${annonce.title} ${index + 1}`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-base-200 flex items-center gap-5 pt-3 pb-3 pl-7 pr-7 rounded-lg shadow">
        <h2 className="text-2xl font-bold">{annonce.price}€</h2>
        <button className="btn btn-primary">Acheter</button>
      </div>
    </div>
  );
}

function relationContainsUser(users: Annonce["favorites"], userId: number) {
  return (
    users?.some((user) => {
      if (typeof user === "string") {
        return user.endsWith(`/users/${userId}`);
      }

      return user.id === userId;
    }) ?? false
  );
}
