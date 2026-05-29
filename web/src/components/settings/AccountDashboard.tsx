type WeekSale = {
  count: number
  label: string
  percent: number
}

type AccountDashboardProps = {
  annonceCount: number
  earnedAmount: string
  favoriteCount: number
  monthlySales: WeekSale[]
  ratedCount: number
  ratingLabel: string
  soldCount: number
}

export function AccountDashboard({
  annonceCount,
  earnedAmount,
  favoriteCount,
  monthlySales,
  ratedCount,
  ratingLabel,
  soldCount,
}: AccountDashboardProps) {
  return (
    <section className="rounded-lg border border-base-300 bg-base-100 p-6">
      <div className="border-b border-base-300 pb-5">
        <h2 className="text-2xl font-bold">Mon compte</h2>
        <p className="text-sm text-base-content/60">Vue rapide de votre activité.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStat label="Rating" value={ratingLabel} detail="sur 5" />
        <DashboardStat label="Annonces" value={String(annonceCount)} detail="publiées" />
        <DashboardStat label="Vendues" value={String(soldCount)} detail="ventes terminées" />
        <DashboardStat label="Gagné" value={earnedAmount} detail="total vendu" />
      </div>

      <div className="mt-6 rounded-lg border border-base-300 bg-base-100 p-5">
        <div>
          <h3 className="font-semibold">Ventes du dernier mois</h3>
          <p className="text-sm text-base-content/60">{soldCount} vente(s) au total</p>
        </div>
        <div className="mt-6 flex h-44 items-end gap-3">
          {monthlySales.map((week) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={week.label}>
              <div className="flex h-32 w-full items-end rounded bg-base-200">
                <div
                  className="w-full rounded bg-primary"
                  style={{ height: `${week.percent}%`, minHeight: week.count > 0 ? 8 : 0 }}
                  title={`${week.count} vente(s)`}
                />
              </div>
              <span className="text-xs text-base-content/60">{week.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DashboardStat label="Favoris" value={String(favoriteCount)} detail="annonces suivies" />
        <DashboardStat label="Ratings donnés" value={String(ratedCount)} detail="avis envoyés" />
      </div>
    </section>
  )
}

function DashboardStat({ detail, label, value }: { detail: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-5">
      <p className="text-sm text-base-content/60">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-base-content/50">{detail}</p>
    </div>
  )
}
