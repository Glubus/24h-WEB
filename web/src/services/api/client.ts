import type {
  Annonce,
  AnnonceCategoryResource,
  AnnonceEdit,
  AnnonceFilters,
  AnnonceListItem,
  ApiCollection,
  ApiId,
  Conversation,
  CreateAnnoncePayload,
  CreateMessagePayload,
  CreateUserPayload,
  LoginCredentials,
  LoginResponse,
  Message,
  UpdateAnnoncePayload,
  UpdateUserPayload,
  User,
} from './types'

export type ApiPlatformClientOptions = {
  baseUrl?: string
  token?: string | null
}

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(status: number, payload: unknown, message?: string) {
    super(message ?? `API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export class ApiPlatformClient {
  private readonly baseUrl: string
  private token: string | null

  constructor(options: ApiPlatformClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? import.meta.env.VITE_API_URL ?? '/api')
    this.token = options.token ?? null
  }

  setToken(token: string | null) {
    this.token = token
  }

  getToken() {
    return this.token
  }

  async login(credentials: LoginCredentials) {
    const response = await this.postJson<LoginResponse>('/login', credentials, {
      accept: 'application/json',
      contentType: 'application/json',
    })

    this.setToken(response.token)

    return response
  }

  listAnnonces(filters: AnnonceFilters = {}) {
    return this.get<ApiCollection<AnnonceListItem>>(`/annonces${this.toAnnonceQuery(filters)}`, { authenticated: false })
  }

  getAnnonce(id: ApiId) {
    return this.get<Annonce>(`/annonces/${id}`, { authenticated: false })
  }

  getAnnonceForEdit(id: ApiId) {
    return this.get<AnnonceEdit>(`/annonces/${id}/edit`)
  }

  createAnnonce(payload: CreateAnnoncePayload) {
    return this.postJson<Annonce>('/annonces', payload)
  }

  updateAnnonce(id: ApiId, payload: UpdateAnnoncePayload) {
    return this.patchJson<Annonce>(`/annonces/${id}`, payload)
  }

  deleteAnnonce(id: ApiId) {
    return this.delete<void>(`/annonces/${id}`)
  }

  uploadAnnonceImage(id: ApiId, image: File) {
    const formData = new FormData()
    formData.append('image', image)

    return this.request<Annonce>(`/annonces/${id}/image`, {
      method: 'POST',
      body: formData,
    })
  }

  deleteAnnonceImage(id: ApiId, imageIndex: number) {
    return this.delete<void>(`/annonces/${id}/images/${imageIndex}`)
  }

  switchAnnonceMasked(id: ApiId) {
    return this.postJson<Annonce>(`/annonces/${id}/masked`, {})
  }

  toggleAnnonceFavorite(id: ApiId) {
    return this.postJson<Annonce>(`/annonces/${id}/favorite`, {})
  }

  rateAnnonceSeller(id: ApiId, rating: number) {
    return this.postJson<Annonce>(`/annonces/${id}/rate-seller`, { rating })
  }

  startConversationFromAnnonce(id: ApiId) {
    return this.postJson<Conversation>(`/annonces/${id}/conversation`, {})
  }

  listAnnonceCategories() {
    return this.get<ApiCollection<AnnonceCategoryResource>>('/annonces/categories', { authenticated: false })
  }

  listConversations() {
    return this.get<ApiCollection<Conversation>>('/conversations')
  }

  listMessages(conversationId: ApiId) {
    return this.get<ApiCollection<Message>>(`/messages?conversation=/api/conversations/${conversationId}`)
  }

  createMessage(payload: CreateMessagePayload) {
    return this.postJson<Message>('/messages', payload)
  }

  deleteMessage(id: ApiId) {
    return this.delete<void>(`/messages/${id}`)
  }

  whoami() {
    return this.get<User>('/me')
  }

  getUser(id: ApiId) {
    return this.get<User>(`/users/${id}`)
  }

  getUserSummary(id: ApiId) {
    return this.get<User>(`/users/${id}/summary`, { authenticated: false })
  }

  createUser(payload: CreateUserPayload) {
    return this.postJson<User>('/users', payload)
  }

  updateUser(id: ApiId, payload: UpdateUserPayload) {
    return this.patchJson<User>(`/users/${id}`, payload)
  }

  uploadUserImage(id: ApiId, image: File) {
    const formData = new FormData()
    formData.append('image', image)

    return this.request<User>(`/users/${id}/pictures`, {
      method: 'POST',
      body: formData,
    })
  }

  deleteUser(id: ApiId) {
    return this.delete<void>(`/users/${id}`)
  }

  private get<T>(path: string, options: { authenticated?: boolean } = {}) {
    return this.request<T>(path, { method: 'GET' }, options)
  }

  private delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }

  private postJson<T>(
    path: string,
    payload: unknown,
    options: { accept?: string; contentType?: string } = {},
  ) {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Accept: options.accept ?? 'application/ld+json',
        'Content-Type': options.contentType ?? 'application/ld+json',
      },
    })
  }

  private patchJson<T>(path: string, payload: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/ld+json',
        'Content-Type': 'application/merge-patch+json',
      },
    })
  }

  private async request<T>(path: string, init: RequestInit, options: { authenticated?: boolean } = {}) {
    const response = await fetch(this.url(path), {
      ...init,
      headers: this.headers(init.headers, options),
    })

    if (!response.ok) {
      const payload = await this.readResponse(response)
      throw new ApiError(response.status, payload, this.errorMessage(response.status, payload))
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await this.readResponse(response)) as T
  }

  private headers(initHeaders?: HeadersInit, options: { authenticated?: boolean } = {}) {
    const headers = new Headers(initHeaders)

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/ld+json')
    }

    if (options.authenticated !== false && this.token !== null) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    return headers
  }

  private url(path: string) {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  }

  private toAnnonceQuery(filters: AnnonceFilters) {
    const query = new URLSearchParams()

    appendQuery(query, 'title', filters.title)
    appendQuery(query, 'description', filters.description)
    appendQuery(query, 'masked', filters.masked)
    appendQuery(query, 'sold', filters.sold)
    appendQuery(query, 'page', filters.page)

    const categories = Array.isArray(filters.categories)
      ? filters.categories
      : filters.categories === undefined
        ? []
        : [filters.categories]

    for (const category of categories) {
      query.append('categories', category)
    }

    appendQuery(query, 'price[gt]', filters.price?.gt)
    appendQuery(query, 'price[gte]', filters.price?.gte)
    appendQuery(query, 'price[lt]', filters.price?.lt)
    appendQuery(query, 'price[lte]', filters.price?.lte)

    const serialized = query.toString()

    return serialized.length > 0 ? `?${serialized}` : ''
  }

  private async readResponse(response: Response) {
    const text = await response.text()

    if (text.length === 0) {
      return undefined
    }

    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  }

  private errorMessage(status: number, payload: unknown) {
    if (isApiErrorPayload(payload)) {
      return payload.detail ?? payload.description ?? payload.title ?? `API request failed with status ${status}`
    }

    return `API request failed with status ${status}`
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

function appendQuery(query: URLSearchParams, key: string, value: boolean | number | string | undefined) {
  if (value !== undefined) {
    query.append(key, String(value))
  }
}

function isApiErrorPayload(payload: unknown): payload is {
  title?: string
  detail?: string
  description?: string
} {
  return typeof payload === 'object' && payload !== null
}
