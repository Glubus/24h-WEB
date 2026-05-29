import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";
import type { Page } from "../types/page";

type RegisterPageProps = {
  onNavigate: (page: Page) => void;
};

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.createUser({
        email,
        username,
        phone: phone.length > 0 ? phone : null,
        password,
      });

      onNavigate("login");
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Inscription impossible",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex justify-center py-12">
      <div className="card mt-6 w-full max-w-md border border-base-300 bg-base-100 shadow-xl">
        <form className="card-body gap-4" onSubmit={handleSubmit}>
          <div className="mb-1">
            <h2 className="card-title text-2xl">Inscription</h2>
            <p className="mt-1 text-sm text-base-content/60">
              Créez votre compte en quelques secondes.
            </p>
          </div>

          {error === null ? null : (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
              <UserIcon />
              <input
                autoComplete="username"
                className="grow"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nom d'utilisateur"
                required
                type="text"
                value={username}
              />
            </label>

            <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
              <MailIcon />
              <input
                autoComplete="email"
                className="grow"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                required
                type="email"
                value={email}
              />
            </label>

            <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
              <PhoneIcon />
              <input
                autoComplete="tel"
                className="grow"
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Téléphone"
                type="tel"
                value={phone}
              />
            </label>

            <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
              <KeyIcon />
              <input
                autoComplete="new-password"
                className="grow"
                minLength={4}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mot de passe"
                required
                type="password"
                value={password}
              />
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-2 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            Créer le compte
          </button>

          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={() => onNavigate("login")}
          >
            Déjà inscrit ? Se connecter
          </button>
          <button
            type="button"
            className="btn btn-ghost w-full"
            onClick={() => onNavigate("home")}
          >
            Retour
          </button>
        </form>
      </div>
    </main>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-4 w-4 opacity-70"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.79l6.67 3.22c.21.1.45.1.66 0L15 5.29V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
      <path d="M15 6.95 8.98 9.86a2.25 2.25 0 0 1-1.96 0L1 6.95v4.55A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.95Z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      className="h-4 w-4 opacity-70"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M14 6a4 4 0 0 1-4.9 3.9l-1.95 1.95a.5.5 0 0 1-.36.15H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.29a.5.5 0 0 1 .15-.36L6.1 6.9A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="h-4 w-4 opacity-70"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M14 13.5c0 1.38-2.69 2.5-6 2.5s-6-1.12-6-2.5S4.69 10 8 10s6 2.12 6 3.5Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="h-4 w-4 opacity-70"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M3.65 1.33a1.5 1.5 0 0 1 2.12.06l1.2 1.27a1.5 1.5 0 0 1 .23 1.75l-.6 1.19a.5.5 0 0 0 .1.58l3.12 3.12a.5.5 0 0 0 .58.1l1.19-.6a1.5 1.5 0 0 1 1.75.23l1.27 1.2a1.5 1.5 0 0 1 .06 2.12l-.57.64c-.6.68-1.5 1.02-2.4.86C6.83 12.99 3.01 9.17 2.15 4.3a2.8 2.8 0 0 1 .86-2.4l.64-.57Z" />
    </svg>
  );
}
