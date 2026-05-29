import type { ChangeEvent, FormEvent } from "react";
import type { Page } from "../../types/page";
import { KeyIcon, MailIcon, PhoneIcon, UserIcon } from "./SettingsIcons";

type AccountSettingsFormProps = {
  confirmPassword: string;
  currentPassword: string;
  email: string;
  error: string | null;
  isSaving: boolean;
  newPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNavigate: (page: Page) => void;
  onNewPasswordChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (value: string) => void;
  phone: string;
  success: string | null;
  username: string;
};

export function AccountSettingsForm({
  confirmPassword,
  currentPassword,
  email,
  error,
  isSaving,
  newPassword,
  onConfirmPasswordChange,
  onCurrentPasswordChange,
  onEmailChange,
  onImageChange,
  onNavigate,
  onNewPasswordChange,
  onPhoneChange,
  onSubmit,
  onUsernameChange,
  phone,
  success,
  username,
}: AccountSettingsFormProps) {
  return (
    <form
      className="rounded-lg border border-base-300 bg-base-100 p-6"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2 border-b border-base-300 pb-5">
        <h2 className="text-2xl font-bold">Paramètres</h2>
        <p className="text-sm text-base-content/60">
          Modifiez les informations principales de votre compte.
        </p>
      </div>

      {error === null ? null : (
        <div className="alert alert-error mt-5 text-sm">
          <span>{error}</span>
        </div>
      )}

      {success === null ? null : (
        <div className="alert alert-success mt-5 text-sm">
          <span>{success}</span>
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
          <UserIcon />
          <input
            className="grow"
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="Nom utilisateur"
            required
            type="text"
            value={username}
          />
        </label>

        <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
          <MailIcon />
          <input
            className="grow"
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="Email"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
          <PhoneIcon />
          <input
            className="grow"
            onChange={(event) => onPhoneChange(event.target.value)}
            placeholder="Téléphone"
            type="tel"
            value={phone}
          />
        </label>

        <label className="file-input file-input-bordered flex h-12 w-full items-center bg-base-200/60">
          <input
            accept="image/*"
            className="w-full"
            onChange={onImageChange}
            type="file"
          />
        </label>
      </div>

      <div className="divider my-7">Mot de passe</div>

      <div className="grid gap-5 md:grid-cols-3">
        <PasswordField
          autoComplete="current-password"
          onChange={onCurrentPasswordChange}
          placeholder="Mot de passe actuel"
          value={currentPassword}
        />
        <PasswordField
          autoComplete="new-password"
          onChange={onNewPasswordChange}
          placeholder="Nouveau mot de passe"
          value={newPassword}
        />
        <PasswordField
          autoComplete="new-password"
          onChange={onConfirmPasswordChange}
          placeholder="Confirmation"
          value={confirmPassword}
        />
      </div>

      <div className="mt-7 flex justify-end gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onNavigate("home")}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary min-w-36"
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : null}
          Enregistrer
        </button>
      </div>
    </form>
  );
}

function PasswordField({
  autoComplete,
  onChange,
  placeholder,
  value,
}: {
  autoComplete: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
      <KeyIcon />
      <input
        autoComplete={autoComplete}
        className="grow"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="password"
        value={value}
      />
    </label>
  );
}
