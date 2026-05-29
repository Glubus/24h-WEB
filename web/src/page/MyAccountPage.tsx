import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AccountDashboard } from "../components/settings/AccountDashboard";
import { AccountSettingsForm } from "../components/settings/AccountSettingsForm";
import { AccountSidebar } from "../components/settings/AccountSidebar";
import type { AccountSection } from "../components/settings/AccountSidebar";
import { api } from "../services/api";
import type { AnnonceListItem, User } from "../services/api";
import { userPictureUrl } from "../services/api/assets";
import type { Page } from "../types/page";

type MyAccountPageProps = {
  currentUser: User | null;
  onNavigate: (page: Page) => void;
  onUserChange: (user: User) => void;
};

export function MyAccountPage({
  currentUser,
  onNavigate,
  onUserChange,
}: MyAccountPageProps) {
  const [user, setUser] = useState<User | null>(currentUser);
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [profileImage, setProfileImage] = useState<string | null>(() =>
    currentUser?.id === undefined ? null : userPictureUrl(currentUser.id),
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(currentUser === null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] =
    useState<AccountSection>("dashboard");
  const [accountAnnonces, setAccountAnnonces] = useState<AnnonceListItem[]>([]);

  const userId = user?.id;
  const rating = user?.rating ?? 0;
  const soldAnnonces = useMemo(
    () => accountAnnonces.filter((annonce) => annonce.sold),
    [accountAnnonces],
  );

  useEffect(() => {
    if (currentUser !== null) {
      hydrateUser(currentUser);
      return;
    }

    const token = localStorage.getItem("api_token");
    if (token === null) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    api.setToken(token);
    api
      .whoami()
      .then((loadedUser) => {
        hydrateUser(loadedUser);
        onUserChange(loadedUser);
      })
      .catch(() => {
        setError("Impossible de charger votre profil.");
      })
      .finally(() => setIsLoading(false));
  }, [currentUser, onUserChange]);

  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    let isCurrent = true;

    api
      .listAnnonces()
      .then((collection) => {
        if (isCurrent) {
          setAccountAnnonces(
            collection.member.filter(
              (annonce) => annonceAuthorId(annonce) === userId,
            ),
          );
        }
      })
      .catch(() => {
        if (isCurrent) {
          setAccountAnnonces([]);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [userId]);

  function hydrateUser(nextUser: User) {
    setUser(nextUser);
    setEmail(nextUser.email ?? "");
    setUsername(nextUser.username);
    setPhone(nextUser.phone ?? "");
    setProfileImage(
      nextUser.id === undefined ? null : userPictureUrl(nextUser.id),
    );
    setIsLoading(false);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file === undefined) {
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setProfileImage(typeof reader.result === "string" ? reader.result : null);
    });
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (userId === undefined) {
      setError("Utilisateur introuvable.");
      return;
    }

    if (newPassword.length > 0 && newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsSaving(true);

    try {
      let updatedUser = await api.updateUser(userId, {
        email,
        phone: phone.length > 0 ? phone : null,
        username,
      });

      if (selectedImage !== null) {
        updatedUser = await api.uploadUserImage(userId, selectedImage);
      }

      hydrateUser(updatedUser);
      onUserChange(updatedUser);
      setSelectedImage(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Profil mis à jour.");
    } catch (settingsError) {
      setError(
        settingsError instanceof Error
          ? settingsError.message
          : "Mise à jour impossible.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  if (user === null) {
    return (
      <main className="mx-auto max-w-xl py-16">
        <div className="rounded-lg border border-base-300 bg-base-100 p-6">
          <h1 className="text-2xl font-bold">Mon compte</h1>
          <p className="mt-2 text-base-content/70">
            Connectez-vous pour accéder à votre compte.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => onNavigate("login")}
          >
            Connexion
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
        <AccountSidebar
          activeSection={activeSection}
          onImageChange={handleImageChange}
          onSectionChange={setActiveSection}
          profileImage={profileImage}
          user={user}
        />

        {activeSection === "dashboard" ? (
          <AccountDashboard
            annonceCount={accountAnnonces.length}
            earnedAmount={formatEuro(
              soldAnnonces.reduce(
                (total, annonce) => total + Number(annonce.price),
                0,
              ),
            )}
            favoriteCount={user.favoriteAnnonces?.length ?? 0}
            monthlySales={salesByWeek(soldAnnonces)}
            ratedCount={user.ratedAnnonces?.length ?? 0}
            ratingLabel={rating.toFixed(1).replace(".", ",")}
            soldCount={soldAnnonces.length}
          />
        ) : (
          <AccountSettingsForm
            confirmPassword={confirmPassword}
            currentPassword={currentPassword}
            email={email}
            error={error}
            isSaving={isSaving}
            newPassword={newPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onCurrentPasswordChange={setCurrentPassword}
            onEmailChange={setEmail}
            onImageChange={handleImageChange}
            onNavigate={onNavigate}
            onNewPasswordChange={setNewPassword}
            onPhoneChange={setPhone}
            onSubmit={handleSubmit}
            onUsernameChange={setUsername}
            phone={phone}
            success={success}
            username={username}
          />
        )}
      </div>
    </main>
  );
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function annonceAuthorId(annonce: AnnonceListItem) {
  if (typeof annonce.author !== "string") {
    return annonce.author.id;
  }

  const match = annonce.author.match(/\/users\/(?<id>\d+)$/);

  return match?.groups?.id === undefined ? undefined : Number(match.groups.id);
}

function salesByWeek(annonces: AnnonceListItem[]) {
  const now = new Date();
  const weeks = [3, 2, 1, 0].map((weekOffset) => {
    const start = new Date(now);
    start.setDate(now.getDate() - (weekOffset + 1) * 7);

    const end = new Date(now);
    end.setDate(now.getDate() - weekOffset * 7);

    return {
      count: annonces.filter((annonce) => {
        if (annonce.soldAt === null || annonce.soldAt === undefined) {
          return false;
        }

        const soldAt = new Date(annonce.soldAt);

        return soldAt >= start && soldAt < end;
      }).length,
      label: `S-${weekOffset}`,
    };
  });
  const maxCount = Math.max(1, ...weeks.map((week) => week.count));

  return weeks.map((week) => ({
    ...week,
    percent: (week.count / maxCount) * 100,
  }));
}
