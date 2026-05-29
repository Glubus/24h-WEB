import { ApiPlatformClient } from "./client";

export { ApiError, ApiPlatformClient } from "./client";
export type { ApiPlatformClientOptions } from "./client";
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
  Conversation,
  CreateMessagePayload,
  CreateAnnoncePayload,
  CreateUserPayload,
  JsonLdResource,
  LoginCredentials,
  LoginResponse,
  Message,
  UpdateAnnoncePayload,
  UpdateUserPayload,
  User,
} from "./types";

export const api = new ApiPlatformClient();
