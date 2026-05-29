export type ApiId = string | number
export type ApiIri = string

export type AnnonceCategory = 'car' | 'electronic' | 'sport' | 'home'

export type AnnoncePriceFilter = {
  gt?: number | string
  gte?: number | string
  lt?: number | string
  lte?: number | string
}

export type AnnonceFilters = {
  title?: string
  description?: string
  categories?: AnnonceCategory | AnnonceCategory[]
  masked?: boolean
  sold?: boolean
  price?: AnnoncePriceFilter
  page?: number
}

export type JsonLdResource = {
  '@id'?: string
  '@type'?: string
}

export type ApiCollection<T> = JsonLdResource & {
  member: T[]
  totalItems: number
  view?: JsonLdResource & Record<string, unknown>
  search?: Record<string, unknown>
}

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  username: string
}

export type User = JsonLdResource & {
  id?: number
  email: string
  username: string
  phone?: string | null
  profileImagePath?: string | null
  rating?: number | null
  annonces?: ApiIri[]
  ratedAnnonces?: ApiIri[]
  favoriteAnnonces?: ApiIri[]
  userIdentifier?: string
}

export type Conversation = JsonLdResource & {
  id: number
  userOne: User
  userTwo: User
  createdAt: string
}

export type Message = JsonLdResource & {
  id: number
  conversation: Conversation
  author: User
  content?: string | null
  annonce?: AnnonceListItem | ApiIri | null
  deleted: boolean
  createdAt: string
}

export type CreateMessagePayload = {
  conversation: ApiIri
  content?: string | null
  annonce?: ApiIri | null
}

export type CreateUserPayload = {
  email: string
  username: string
  password: string
  phone?: string | null
  rating?: number | null
}

export type UpdateUserPayload = Partial<
  Pick<CreateUserPayload, 'email' | 'username' | 'phone' | 'rating'>
>

export type AnnonceListItem = JsonLdResource & {
  id: number
  title: string
  description: string
  author: ApiIri | User
  images: string[]
  city?: string | null
  price: string
  categories: AnnonceCategory[]
  masked: boolean
  sold: boolean
  soldAt?: string | null
  latitude?: string | null
  longitude?: string | null
  createdAt: string
}

export type Annonce = AnnonceListItem & {
  ratings?: ApiIri[] | User[]
  favorites?: ApiIri[] | User[]
}

export type AnnonceEdit = Annonce & {
  address?: string | null
}

export type CreateAnnoncePayload = {
  title: string
  description: string
  author: ApiIri
  address?: string | null
  city?: string | null
  price: string | number
  categories: AnnonceCategory[]
  images?: string[]
  masked?: boolean
  sold?: boolean
  latitude?: string | number | null
  longitude?: string | number | null
}

export type UpdateAnnoncePayload = Partial<CreateAnnoncePayload>

export type AnnonceCategoryResource = JsonLdResource & {
  name: AnnonceCategory
}
