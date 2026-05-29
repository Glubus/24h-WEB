import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import type { AnnonceListItem, Conversation, Message, User } from '../services/api'
import { annonceImageUrl, userPictureUrl } from '../services/api/assets'
import type { Page } from '../types/page'
import { formatUsername } from '../utils/formatUsername'

type ChatPageProps = {
  currentUser: User | null
  initialConversationId: number | null
  onNavigate: (page: Page) => void
}

export function ChatPage({ currentUser, initialConversationId, onNavigate }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [annonces, setAnnonces] = useState<AnnonceListItem[]>([])
  const [content, setContent] = useState('')
  const [linkedAnnonce, setLinkedAnnonce] = useState<AnnonceListItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) ?? null
  const selectedOtherUser = selectedConversation === null || currentUser === null ? null : otherParticipant(selectedConversation, currentUser)
  const linkableAnnonces = selectedConversation === null
    ? []
    : annonces.filter((annonce) => {
        const id = annonceAuthorId(annonce)

        return id === selectedConversation.userOne.id || id === selectedConversation.userTwo.id
      })

  useEffect(() => {
    if (currentUser === null) {
      return
    }

    let isCurrent = true

    async function loadConversations() {
      setError(null)

      try {
        const response = await api.listConversations()

        if (!isCurrent) {
          return
        }

        setConversations(response.member)
        setSelectedConversationId((currentId) => currentId ?? initialConversationId ?? response.member[0]?.id ?? null)
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les conversations.')
        }
      }
    }

    void loadConversations()

    return () => {
      isCurrent = false
    }
  }, [currentUser, initialConversationId])

  useEffect(() => {
    if (currentUser === null) {
      return
    }

    let isCurrent = true

    async function loadAnnonces() {
      try {
        const response = await api.listAnnonces()

        if (isCurrent) {
          setAnnonces(response.member)
        }
      } catch {
        if (isCurrent) {
          setAnnonces([])
        }
      }
    }

    void loadAnnonces()

    return () => {
      isCurrent = false
    }
  }, [currentUser])

  useEffect(() => {
    if (selectedConversationId === null) {
      queueMicrotask(() => setMessages([]))
      return
    }

    const conversationId = selectedConversationId
    let isCurrent = true

    async function loadMessages() {
      setError(null)

      try {
        const response = await api.listMessages(conversationId)

        if (isCurrent) {
          setMessages(response.member)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les messages.')
        }
      }
    }

    void loadMessages()

    return () => {
      isCurrent = false
    }
  }, [selectedConversationId])

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (selectedConversationId === null) {
      setError('Sélectionnez une conversation.')
      return
    }

    try {
      const message = await api.createMessage({
        conversation: `/api/conversations/${selectedConversationId}`,
        content: content.trim().length > 0 ? content : null,
        annonce: linkedAnnonce === null ? null : `/api/annonces/${linkedAnnonce.id}`,
      })

      setMessages((currentMessages) => [...currentMessages, message])
      setContent('')
      setLinkedAnnonce(null)
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Message impossible.')
    }
  }

  async function handleDeleteMessage(messageId: number) {
    await api.deleteMessage(messageId)
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, content: 'Message supprimé', deleted: true } : message,
      ),
    )
  }

  if (currentUser === null) {
    return (
      <main className="mx-auto max-w-xl py-16">
        <div className="rounded-lg border border-base-300 bg-base-100 p-6">
          <h1 className="text-2xl font-bold">Chat</h1>
          <p className="mt-2 text-base-content/70">Connectez-vous pour accéder aux conversations.</p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => onNavigate('login')}>
            Connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="py-8">
      <div className="grid min-h-[650px] gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-base-300 bg-base-100 p-4">
          <h2 className="px-2 text-sm font-semibold uppercase text-base-content/60">Conversations</h2>
          <div className="mt-3 flex flex-col gap-2">
            {conversations.map((conversation) => {
              const otherUser = otherParticipant(conversation, currentUser)
              const avatarUrl = otherUser.id === undefined ? null : userPictureUrl(otherUser.id)
              const initial = otherUser.username.charAt(0).toUpperCase()

              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`btn h-auto justify-start py-3 ${conversation.id === selectedConversationId ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <span className={`avatar shrink-0 ${avatarUrl === null ? 'placeholder' : ''}`}>
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-primary text-primary-content">
                      {avatarUrl === null ? <span>{initial}</span> : <img src={avatarUrl} alt={otherUser.username} />}
                    </div>
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{formatUsername(otherUser.username)}</span>
                      <time className="ml-auto shrink-0 text-xs opacity-60" dateTime={conversation.createdAt}>
                        {formatTime(conversation.createdAt)}
                      </time>
                    </span>
                    <span className="block text-xs opacity-70">
                      {otherUser.successfulSaleCount ?? 0} ventes réussies · ★ {formatRating(otherUser.rating)}
                    </span>
                  </span>
                </button>
              )
            })}
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-sm text-base-content/60">
                Aucune conversation pour le moment.
              </p>
            ) : null}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col rounded-lg border border-base-300 bg-base-100">
          <header className="border-b border-base-300 p-4">
            {selectedOtherUser === null ? (
              <h1 className="text-xl font-bold">Chat</h1>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`avatar ${selectedOtherUser.id === undefined ? 'placeholder' : ''}`}>
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-primary text-primary-content">
                    {selectedOtherUser.id === undefined
                      ? <span>{selectedOtherUser.username.charAt(0).toUpperCase()}</span>
                      : <img src={userPictureUrl(selectedOtherUser.id)} alt={selectedOtherUser.username} />}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{formatUsername(selectedOtherUser.username)}</h1>
                  <p className="text-sm text-base-content/60">
                    {selectedOtherUser.successfulSaleCount ?? 0} ventes réussies · ★ {formatRating(selectedOtherUser.rating)}
                  </p>
                </div>
              </div>
            )}
            {error === null ? null : <p className="mt-1 text-sm text-error">{error}</p>}
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => {
              const isMine = message.author.id === currentUser.id

              return (
                <div key={message.id} className={`chat ${isMine ? 'chat-end' : 'chat-start'}`}>
                  <div className="chat-header flex items-center gap-2">
                    <span>{formatUsername(message.author.username)}</span>
                    <time className="text-xs opacity-60" dateTime={message.createdAt}>
                      {formatTime(message.createdAt)}
                    </time>
                  </div>
                  <div className={`chat-bubble ${message.deleted ? 'opacity-60' : ''}`}>
                    {message.content}
                    {message.annonce === null || message.annonce === undefined || typeof message.annonce === 'string' ? null : (
                      <div className="mt-3 flex gap-3 rounded bg-base-100/20 p-2 text-sm">
                        <img
                          className="h-14 w-16 rounded object-cover"
                          src={message.annonce.images.length > 0 ? annonceImageUrl(message.annonce.id) : undefined}
                          alt={message.annonce.title}
                        />
                        <div>
                          <div className="font-semibold">{message.annonce.title}</div>
                          <div>{message.annonce.price} EUR</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {message.deleted ? null : (
                    <button type="button" className="chat-footer text-xs opacity-70" onClick={() => handleDeleteMessage(message.id)}>
                      supprimer
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <form className="grid gap-2 border-t border-base-300 p-4 md:grid-cols-[1fr_auto_auto]" onSubmit={handleSendMessage}>
            <input
              className="input input-bordered"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Message"
              value={content}
            />
            <div className="dropdown dropdown-top dropdown-end">
              <button type="button" className="btn btn-outline" tabIndex={0} title="Lier une annonce">
                <LinkIcon />
                {linkedAnnonce === null ? null : <span className="max-w-32 truncate">{linkedAnnonce.title}</span>}
              </button>
              <div className="dropdown-content z-[1] max-h-80 w-80 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow">
                {linkedAnnonce === null ? null : (
                  <button type="button" className="btn btn-ghost btn-sm mb-2 w-full justify-start" onClick={() => setLinkedAnnonce(null)}>
                    Retirer l'annonce
                  </button>
                )}
                {linkableAnnonces.map((annonce) => (
                  <button
                    key={annonce.id}
                    type="button"
                    className={`btn h-auto w-full justify-start gap-3 py-2 ${linkedAnnonce?.id === annonce.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setLinkedAnnonce(annonce)}
                  >
                    <img
                      className="h-12 w-14 rounded object-cover"
                      src={annonce.images.length > 0 ? annonceImageUrl(annonce.id) : undefined}
                      alt={annonce.title}
                    />
                    <span className="min-w-0 text-left">
                      <span className="block truncate">{annonce.title}</span>
                      <span className="block text-xs opacity-70">{annonce.price} EUR</span>
                    </span>
                  </button>
                ))}
                {linkableAnnonces.length === 0 ? (
                  <p className="p-3 text-sm text-base-content/60">Aucune annonce disponible.</p>
                ) : null}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={selectedConversationId === null}>
              Envoyer
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

function otherParticipant(conversation: Conversation, currentUser: User) {
  return conversation.userOne.id === currentUser.id ? conversation.userTwo : conversation.userOne
}

function annonceAuthorId(annonce: AnnonceListItem) {
  if (typeof annonce.author !== 'string') {
    return annonce.author.id
  }

  const match = annonce.author.match(/\/(\d+)$/)

  return match ? Number(match[1]) : undefined
}

function formatRating(rating?: number | null) {
  return rating === null || rating === undefined ? '0.0' : rating.toFixed(1)
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.9 5.03" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07l1.22-1.22" />
    </svg>
  )
}
