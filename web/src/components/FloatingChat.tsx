import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CardAiAnnonce } from './CardAiAnnonce'

type ChatMessage = {
  id: number
  author: 'me' | 'bot'
  content: string
  annonceIds?: number[]
}

type FloatingChatProps = {
  onNavigateAnnonce?: (id: number) => void
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, author: 'bot', content: 'Bonjour 👋 Comment pouvons-nous vous aider ?' },
]

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL ?? 'http://localhost:9000'

function formatHistorique(messages: ChatMessage[]): string {
  return messages
    .map((message) => `${message.author === 'me' ? 'Utilisateur' : 'Assistant'}: ${message.content}`)
    .join('\n')
}

export function FloatingChat({ onNavigateAnnonce }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmed = content.trim()
    if (trimmed === '' || isSending) {
      return
    }

    const userMessage: ChatMessage = { id: Date.now(), author: 'me', content: trimmed }
    const historique = formatHistorique(messages)

    setMessages((current) => [...current, userMessage])
    setContent('')
    setIsSending(true)

    try {
      const apiResponse = await fetch(`${CHAT_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historique, lastMessage: trimmed }),
      })

      if (!apiResponse.ok) {
        throw new Error(`Erreur ${apiResponse.status}`)
      }

      const data: { message_response: string; list_annonces: number[] } = await apiResponse.json()

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          author: 'bot',
          content: data.message_response,
          annonceIds: Array.isArray(data.list_annonces) ? data.list_annonces : [],
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, author: 'bot', content: 'Désolé, une erreur est survenue. Réessayez plus tard.' },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[32rem] w-90 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xl">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-content">
            <div className="flex items-center gap-2">

              <div className="leading-tight">
                <p className="text-sm font-semibold">Support LeBon</p>
                <p className="text-xs opacity-80">En ligne</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-base-200 p-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`chat ${message.author === 'me' ? 'chat-end' : 'chat-start'}`}>
                  <div
                    className={`chat-bubble ${message.author === 'me' ? 'chat-bubble-primary' : ''}`}
                  >
                    {message.content}
                  </div>
                </div>
                {message.annonceIds && message.annonceIds.length > 0 ? (
                  <div className="carousel mt-1 w-full gap-2 pb-1">
                    {message.annonceIds.map((annonceId) => (
                      <div className="carousel-item" key={annonceId}>
                        <CardAiAnnonce
                          annonceId={annonceId}
                          onClick={onNavigateAnnonce ? () => onNavigateAnnonce(annonceId) : undefined}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-base-300 p-3">
            <input
              className="input input-bordered input-sm flex-1"
              placeholder="Écrivez un message…"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={isSending}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSending}>
              {isSending ? <span className="loading loading-spinner loading-xs" /> : 'Envoyer'}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="btn btn-circle btn-primary btn-lg shadow-lg"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {isOpen ? (
          <span className="text-xl">✕</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
