import type { Page } from '../types/page'

type LoginPageProps = {
  onNavigate: (page: Page) => void
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-base-200 p-4">
      <div className="mx-auto flex min-h-[calc(100vh-97px)] max-w-md items-center">
        <div className="card w-full bg-base-100 shadow-xl">
          <form className="card-body">
            <h1 className="card-title text-2xl">Connexion</h1>
            <label className="form-control">
              <span className="label-text">Email</span>
              <input
                type="email"
                className="input input-bordered"
                placeholder="email@example.com"
              />
            </label>
            <label className="form-control">
              <span className="label-text">Mot de passe</span>
              <input
                type="password"
                className="input input-bordered"
                placeholder="Votre mot de passe"
              />
            </label>
            <div className="card-actions mt-4 justify-between">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onNavigate('home')}
              >
                Retour
              </button>
              <button type="submit" className="btn btn-primary">
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
