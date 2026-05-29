import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import type { Conversation, Message, User } from '../services/api'
import type { Page } from '../types/page'

type ChatPageProps = {
  currentUser: User | null
  onNavigate: (page: Page) => void
}

export function ChatPage({ currentUser, onNavigate }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [annonceId, setAnnonceId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) ?? null

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
        setSelectedConversationId((currentId) => currentId ?? response.member[0]?.id ?? null)
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
        annonce: annonceId.trim().length > 0 ? `/api/annonces/${annonceId}` : null,
      })

      setMessages((currentMessages) => [...currentMessages, message])
      setContent('')
      setAnnonceId('')
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
              const otherUser = conversation.userOne.id === currentUser.id ? conversation.userTwo : conversation.userOne

              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`btn justify-start ${conversation.id === selectedConversationId ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  {otherUser.username}
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
            <h1 className="text-xl font-bold">
              {selectedConversation === null ? 'Chat' : conversationTitle(selectedConversation, currentUser)}
            </h1>
            {error === null ? null : <p className="mt-1 text-sm text-error">{error}</p>}
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => {
              const isMine = message.author.id === currentUser.id

              return (
                <div key={message.id} className={`chat ${isMine ? 'chat-end' : 'chat-start'}`}>
                  <div className="chat-header">{message.author.username}</div>
                  <div className={`chat-bubble ${message.deleted ? 'opacity-60' : ''}`}>
                    {message.content}
                    {message.annonce === null || message.annonce === undefined || typeof message.annonce === 'string' ? null : (
                      <div className="mt-2 rounded bg-base-100/20 p-2 text-sm">
                        <div className="font-semibold">{message.annonce.title}</div>
                        <div>{message.annonce.price} EUR</div>
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

          <form className="grid gap-2 border-t border-base-300 p-4 md:grid-cols-[1fr_160px_auto]" onSubmit={handleSendMessage}>
            <input
              className="input input-bordered"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Message"
              value={content}
            />
            <input
              className="input input-bordered"
              onChange={(event) => setAnnonceId(event.target.value)}
              placeholder="ID annonce"
              type="number"
              value={annonceId}
            />
            <button type="submit" className="btn btn-primary" disabled={selectedConversationId === null}>
              Envoyer
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

function conversationTitle(conversation: Conversation, currentUser: User) {
  const otherUser = conversation.userOne.id === currentUser.id ? conversation.userTwo : conversation.userOne

  return otherUser.username
}
