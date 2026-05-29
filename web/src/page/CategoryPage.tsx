import { Heart, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Page } from '../types/page'
import { useAnnonces } from '../hooks/useAnnonces'
import { SmallCardAnnonce } from '../components/SmallCardAnnonce.tsx'
import type { AnnonceCategory, AnnonceFilters, User } from '../services/api'
import { CategoryDisplay } from '../components/CategoryDisplay'

type CategoryPageProps = {
    currentUser: User | null
    onNavigate: (page: Page) => void
    category: string
    onNavigateAnnonce: (id: number) => void
}

type CategoryFilterValues = {
    title: string
    description: string
    priceMin: string
    priceMax: string
}

const emptyFilters: CategoryFilterValues = {
    title: '',
    description: '',
    priceMin: '',
    priceMax: '',
}

export function CategoryPage({ currentUser, category, onNavigateAnnonce }: CategoryPageProps) {
    const [draftFilters, setDraftFilters] = useState<CategoryFilterValues>(emptyFilters)
    const [appliedFilters, setAppliedFilters] = useState<CategoryFilterValues>(emptyFilters)
    const isFavoritesCategory = category === 'favorites'
    const currentUserId = currentUser?.id
    const apiFilters = useMemo(
        () => buildAnnonceFilters(category, appliedFilters),
        [appliedFilters, category],
    )
    const { annonces, loading, error } = useAnnonces(apiFilters)
    const visibleAnnonces = isFavoritesCategory
        ? currentUserId === undefined
            ? []
            : annonces.filter((annonce) => relationContainsUser(annonce.favorites, currentUserId))
        : annonces

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setAppliedFilters(draftFilters)
    }

    function handleReset() {
        setDraftFilters(emptyFilters)
        setAppliedFilters(emptyFilters)
    }

    return (
        <div className="mt-6">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            <CategoryDisplay category={category} iconClassName="h-7 w-7" />
                        </h1>
                        <p className="mt-1 text-sm text-base-content/60">
                            {isFavoritesCategory
                                ? 'Vos annonces favorites, avec les mêmes filtres.'
                                : 'Filtrez les annonces disponibles.'}
                        </p>
                    </div>
                    {loading ? <span className="loading loading-spinner loading-sm" /> : null}
                </div>

                {isFavoritesCategory && currentUserId === undefined ? (
                    <div className="alert">
                        <Heart className="h-5 w-5" />
                        <span>Connectez-vous pour voir vos favoris.</span>
                    </div>
                ) : null}

                <form className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm" onSubmit={handleSubmit}>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content/70">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filtres</span>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_140px_auto]">
                        <label className="input input-bordered flex h-11 w-full items-center gap-2 bg-base-200/60 focus-within:bg-base-100">
                            <Search className="h-4 w-4 opacity-60" />
                            <input
                                className="grow"
                                onChange={(event) => setDraftFilters((current) => ({ ...current, title: event.target.value }))}
                                placeholder="Titre"
                                type="search"
                                value={draftFilters.title}
                            />
                        </label>
                        <label className="input input-bordered flex h-11 w-full items-center gap-2 bg-base-200/60 focus-within:bg-base-100">
                            <Search className="h-4 w-4 opacity-60" />
                            <input
                                className="grow"
                                onChange={(event) => setDraftFilters((current) => ({ ...current, description: event.target.value }))}
                                placeholder="Description"
                                type="search"
                                value={draftFilters.description}
                            />
                        </label>
                        <input
                            className="input input-bordered h-11 w-full bg-base-200/60 focus:bg-base-100"
                            inputMode="numeric"
                            min="0"
                            onChange={(event) => setDraftFilters((current) => ({ ...current, priceMin: event.target.value }))}
                            placeholder="Prix min"
                            type="number"
                            value={draftFilters.priceMin}
                        />
                        <input
                            className="input input-bordered h-11 w-full bg-base-200/60 focus:bg-base-100"
                            inputMode="numeric"
                            min="0"
                            onChange={(event) => setDraftFilters((current) => ({ ...current, priceMax: event.target.value }))}
                            placeholder="Prix max"
                            type="number"
                            value={draftFilters.priceMax}
                        />
                        <div className="flex gap-2">
                            <button className="btn btn-primary h-11 flex-1 lg:flex-none" type="submit">
                                Filtrer
                            </button>
                            <button className="btn btn-ghost btn-square h-11" onClick={handleReset} type="button" aria-label="Réinitialiser">
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {loading && <span className="loading loading-spinner loading-lg" />}
            {error && <p className="text-error">Erreur lors du chargement des annonces.</p>}
            <div className="flex flex-wrap gap-4">
                {visibleAnnonces.map(annonce => (
                        <SmallCardAnnonce
                            key={annonce.id}
                            author={annonce.author}
                            createdAt={annonce.createdAt}
	                            currentUserId={currentUser?.id}
	                            id={annonce.id}
	                            favorites={annonce.favorites}
                            masked={annonce.masked}
	                            title={annonce.title}
	                            price={annonce.price}
	                            images={annonce.images}
                            sold={annonce.sold}
	                            city={annonce.city}
                            onClick={() => onNavigateAnnonce(annonce.id)}
                        />
                ))}
            </div>
            {!loading && !error && visibleAnnonces.length === 0 ? (
                <p className="mt-6 rounded-lg border border-base-300 bg-base-100 p-6 text-base-content/70">
                    {isFavoritesCategory ? 'Aucune annonce favorite ne correspond à ces filtres.' : 'Aucune annonce ne correspond à ces filtres.'}
                </p>
            ) : null}
        </div>
    )
}

function buildAnnonceFilters(category: string, filters: CategoryFilterValues): AnnonceFilters {
    const price: NonNullable<AnnonceFilters['price']> = {}
    const title = filters.title.trim()
    const description = filters.description.trim()
    const priceMin = filters.priceMin.trim()
    const priceMax = filters.priceMax.trim()

    if (priceMin.length > 0) {
        price.gte = priceMin
    }

    if (priceMax.length > 0) {
        price.lte = priceMax
    }

    return {
        ...(category === 'favorites' ? {} : { categories: category as AnnonceCategory }),
        masked: false,
        sold: false,
        ...(title.length > 0 ? { title } : {}),
        ...(description.length > 0 ? { description } : {}),
        ...(Object.keys(price).length > 0 ? { price } : {}),
    }
}

function relationContainsUser(users: User[] | string[] | undefined, userId: number) {
    return users?.some((user) => {
        if (typeof user === 'string') {
            return user.endsWith(`/users/${userId}`)
        }

        return user.id === userId
    }) ?? false
}
