import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { AnnoncePreview } from '../components/createAnnonce/AnnoncePreview'
import { CreateAnnonceFields } from '../components/createAnnonce/CreateAnnonceFields'
import { api } from '../services/api'
import type { AnnonceCategory, User } from '../services/api'
import type { Page } from '../types/page'

type CreateAnnoncePageProps = {
  currentUser: User | null
  onNavigate: (page: Page) => void
}

export function CreateAnnoncePage({ currentUser, onNavigate }: CreateAnnoncePageProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<AnnonceCategory>('home')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const imagePreviews = useMemo(
    () => images.map((image) => ({ name: image.name, url: URL.createObjectURL(image) })),
    [images],
  )

  useEffect(() => () => {
    for (const image of imagePreviews) {
      URL.revokeObjectURL(image.url)
    }
  }, [imagePreviews])

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(event.target.files ?? []))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (currentUser?.id === undefined) {
      setError('Connectez-vous pour déposer une annonce.')
      return
    }

    setIsSaving(true)

    try {
      const createdAnnonce = await api.createAnnonce({
        title,
        description,
        price: Number.parseInt(price, 10),
        categories: [category],
        city: city.length > 0 ? city : null,
        address: address.length > 0 ? address : null,
        author: `/api/users/${currentUser.id}`,
        masked: false,
        sold: false,
        images: [],
      })

      for (const image of images) {
        await api.uploadAnnonceImage(createdAnnonce.id, image)
      }

      setTitle('')
      setDescription('')
      setPrice('')
      setCategory('home')
      setCity('')
      setAddress('')
      setImages([])
      setSuccess('Annonce créée.')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Création impossible.')
    } finally {
      setIsSaving(false)
    }
  }

  if (currentUser === null) {
    return (
      <main className="mx-auto max-w-xl py-16">
        <div className="rounded-lg border border-base-300 bg-base-100 p-6">
          <h1 className="text-2xl font-bold">Déposer une annonce</h1>
          <p className="mt-2 text-base-content/70">Connectez-vous pour créer une annonce.</p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => onNavigate('login')}>
            Connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="py-10">
      <form className="mx-auto max-w-3xl rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm" onSubmit={handleSubmit}>
        <div className="border-b border-base-300 pb-5">
          <h1 className="text-2xl font-bold">Déposer une annonce</h1>
          <p className="mt-1 text-sm text-base-content/60">Ajoutez les informations principales du produit.</p>
        </div>

        {error === null ? null : (
          <div className="alert alert-error mt-5 text-sm">
            <span>{error}</span>
          </div>
        )}

        {success === null ? null : (
          <div className="alert alert-success mt-5 text-sm">
            <span>{success}</span>
          </div>
        )}

        <CreateAnnonceFields
          address={address}
          category={category}
          city={city}
          description={description}
          imagePreviews={imagePreviews}
          onAddressChange={setAddress}
          onCategoryChange={setCategory}
          onCityChange={setCity}
          onDescriptionChange={setDescription}
          onImagesChange={handleImagesChange}
          onPriceChange={setPrice}
          onTitleChange={setTitle}
          price={price}
          title={title}
        />

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => onNavigate('home')}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary min-w-44" disabled={isSaving}>
            {isSaving ? <span className="loading loading-spinner loading-sm" /> : null}
            Créer l'annonce
          </button>
        </div>

        <AnnoncePreview
          category={category}
          city={city}
          description={description}
          imagePreviews={imagePreviews}
          price={price}
          title={title}
        />
      </form>
    </main>
  )
}
