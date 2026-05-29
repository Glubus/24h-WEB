import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../services/api'
import type { Page } from '../types/page'
import { useAnnonce } from '../hooks/useAnnonce'
import type { User } from '../services/api'

type PaymentPageProps = {
  annonceId: number | null
  currentUser: User | null
  onNavigate: (page: Page) => void
  onPaid: (annonceId: number) => void
}

export function PaymentPage({ annonceId, currentUser, onNavigate, onPaid }: PaymentPageProps) {
  const { annonce, loading, error } = useAnnonce(annonceId)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (annonceId === null) {
      return
    }

    if (currentUser === null) {
      onNavigate('login')
      return
    }

    setPaymentError(null)
    setIsPaying(true)

    try {
      await api.purchaseAnnonce(annonceId)
      onPaid(annonceId)
    } catch (purchaseError) {
      setPaymentError(purchaseError instanceof Error ? purchaseError.message : 'Paiement impossible.')
    } finally {
      setIsPaying(false)
    }
  }

  if (annonceId === null) {
    return (
      <main className="mx-auto max-w-xl py-12">
        <p>Aucune annonce sélectionnée.</p>
        <button type="button" className="btn btn-primary mt-4" onClick={() => onNavigate('home')}>
          Retour
        </button>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="flex py-16 justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    )
  }

  if (error !== null || annonce === null) {
    return (
      <main className="mx-auto max-w-xl py-12">
        <p className="text-error">Erreur lors du chargement du paiement.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto grid max-w-4xl gap-6 py-10 lg:grid-cols-[1fr_360px]">
      <form className="rounded-lg border border-base-300 bg-base-100 p-6" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold">Paiement</h1>
        <div className="mt-6 grid gap-4">
          <label className="form-control">
            <span className="label-text">Nom sur la carte</span>
            <input className="input input-bordered" value={cardName} onChange={(event) => setCardName(event.target.value)} />
          </label>
          <label className="form-control">
            <span className="label-text">Numéro de carte</span>
            <input className="input input-bordered" inputMode="numeric" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control">
              <span className="label-text">Expiration</span>
              <input className="input input-bordered" placeholder="MM/AA" value={expiry} onChange={(event) => setExpiry(event.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text">CVC</span>
              <input className="input input-bordered" inputMode="numeric" value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} />
            </label>
          </div>
        </div>
        {paymentError === null ? null : <p className="mt-4 text-sm text-error">{paymentError}</p>}
        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={isPaying}>
          {isPaying ? <span className="loading loading-spinner loading-sm" /> : null}
          Payer
        </button>
      </form>
      <aside className="rounded-lg border border-base-300 bg-base-100 p-6">
        <h2 className="text-lg font-semibold">{annonce.title}</h2>
        <p className="mt-2 text-sm text-base-content/60">{annonce.city}</p>
        <p className="mt-6 text-3xl font-bold">{annonce.price}€</p>
      </aside>
    </main>
  )
}
