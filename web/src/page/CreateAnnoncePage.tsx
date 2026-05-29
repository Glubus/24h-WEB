import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { AnnoncePreview } from '../components/createAnnonce/AnnoncePreview'
import { CreateAnnonceFields } from '../components/createAnnonce/CreateAnnonceFields'
import type { ImagePreview } from '../components/createAnnonce/ImagePicker'
import { api } from '../services/api'
import { annonceImageUrl } from '../services/api/assets'
import type { AnnonceCategory, User } from '../services/api'
import type { Page } from '../types/page'

type CreateAnnoncePageProps = {
  currentUser: User | null
  editingAnnonceId: number | null
  onNavigate: (page: Page) => void
  onSavedAnnonce: (id: number) => void
}

export function CreateAnnoncePage({ currentUser, editingAnnonceId, onNavigate, onSavedAnnonce }: CreateAnnoncePageProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<AnnonceCategory>('home')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [existingImagePreviews, setExistingImagePreviews] = useState<ImagePreview[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = editingAnnonceId !== null
  const imagePreviews = useMemo(
    () => [
      ...existingImagePreviews,
      ...images.map((image, index) => ({
        index,
        kind: 'local' as const,
        name: image.name,
        url: URL.createObjectURL(image),
      })),
    ],
    [existingImagePreviews, images],
  )

  useEffect(() => () => {
    for (const image of imagePreviews) {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url)
      }
    }
  }, [imagePreviews])

  useEffect(() => {
    if (editingAnnonceId === null) {
      return
    }

    let isCurrent = true

    api.getAnnonceForEdit(editingAnnonceId)
      .then((annonce) => {
        if (!isCurrent) {
          return
        }

        setTitle(annonce.title)
        setDescription(annonce.description)
        setPrice(String(Math.trunc(Number(annonce.price))))
        setCategory(annonce.categories[0] ?? 'home')
        setCity(annonce.city ?? '')
        setAddress(annonce.address ?? '')
        setExistingImagePreviews(
          annonce.images.map((_, index) => ({
            index,
            kind: 'existing',
            name: `Image ${index + 1}`,
            url: annonceImageUrl(annonce.id, index),
          })),
        )
        setImages([])
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'Chargement impossible.')
        }
      })

    return () => {
      isCurrent = false
    }
  }, [editingAnnonceId])

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setImages((currentImages) => [...currentImages, ...Array.from(event.target.files ?? [])])
    event.target.value = ''
  }

  async function handleDeleteImage(image: ImagePreview) {
    if (image.kind === 'local') {
      setImages((currentImages) => currentImages.filter((_, index) => index !== image.index))
      return
    }

    if (editingAnnonceId === null) {
      return
    }

    try {
      await api.deleteAnnonceImage(editingAnnonceId, image.index)
      const annonce = await api.getAnnonceForEdit(editingAnnonceId)
      setExistingImagePreviews(
        annonce.images.map((_, index) => ({
          index,
          kind: 'existing',
          name: `Image ${index + 1}`,
          url: annonceImageUrl(annonce.id, index),
        })),
      )
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression image impossible.')
    }
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
      const commonPayload = {
        title,
        description,
        price: Number.parseInt(price, 10),
        categories: [category],
        city: city.length > 0 ? city : null,
        address: address.length > 0 ? address : null,
        author: `/api/users/${currentUser.id}`,
      }

      const savedAnnonce = editingAnnonceId === null
        ? await api.createAnnonce({ ...commonPayload, images: [], masked: false, sold: false })
        : await api.updateAnnonce(editingAnnonceId, commonPayload)

      for (const image of images) {
        await api.uploadAnnonceImage(savedAnnonce.id, image)
      }

      if (editingAnnonceId === null) {
        setTitle('')
        setDescription('')
        setPrice('')
        setCategory('home')
        setCity('')
        setAddress('')
        setExistingImagePreviews([])
        setImages([])
      }

      setSuccess(isEditing ? 'Annonce modifiée.' : 'Annonce créée.')
      onSavedAnnonce(savedAnnonce.id)
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
	          <h1 className="text-2xl font-bold">{isEditing ? 'Modifier l’annonce' : 'Déposer une annonce'}</h1>
	          <p className="mt-1 text-sm text-base-content/60">
              {isEditing ? 'Mettez à jour les informations principales du produit.' : 'Ajoutez les informations principales du produit.'}
            </p>
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
          imagePickerLabel={isEditing ? 'Ajouter une image' : 'Choisir des images'}
          imagePreviews={imagePreviews}
          onAddressChange={setAddress}
          onCategoryChange={setCategory}
          onCityChange={setCity}
          onDescriptionChange={setDescription}
          onImagesChange={handleImagesChange}
          onDeleteImage={handleDeleteImage}
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
	            {isEditing ? 'Modifier l’annonce' : 'Créer l’annonce'}
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
