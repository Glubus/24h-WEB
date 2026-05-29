import { ApiPlatformClient } from './client'

export { ApiError, ApiPlatformClient } from './client'
export type { ApiPlatformClientOptions } from './client'
export type {
  Annonce,
  AnnonceCategory,
  AnnonceCategoryResource,
  AnnonceEdit,
  AnnonceFilters,
  AnnonceListItem,
  AnnoncePriceFilter,
  ApiCollection,
  ApiId,
  ApiIri,
  CreateAnnoncePayload,
  CreateUserPayload,
  JsonLdResource,
  LoginCredentials,
  LoginResponse,
  UpdateAnnoncePayload,
  UpdateUserPayload,
  User,
} from './types'

export const api = new ApiPlatformClient()
