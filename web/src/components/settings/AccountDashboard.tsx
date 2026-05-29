import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeekSale = {
  count: number;
  label: string;
  percent: number;
};

type AccountDashboardProps = {
  annonceCount: number;
  earnedAmount: string;
  favoriteCount: number;
  monthlySales: WeekSale[];
  ratedCount: number;
  ratingLabel: string;
  soldCount: number;
};

export function AccountDashboard({
  annonceCount,
  earnedAmount,
  favoriteCount,
  monthlySales,
  ratedCount,
  ratingLabel,
  soldCount,
}: AccountDashboardProps) {
  const chartData = monthlySales.map((week) => ({
    label: week.label,
    ventes: week.count,
  }));

  return (
    <section className="rounded-lg border border-base-300 bg-base-100 p-6">
      <div className="border-b border-base-300 pb-5">
        <h2 className="text-2xl font-bold">Mon compte</h2>
        <p className="text-sm text-base-content/60">
          Vue rapide de votre activité.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStat label="Rating" value={ratingLabel} detail="sur 5" />
        <DashboardStat
          label="Annonces"
          value={String(annonceCount)}
          detail="publiées"
        />
        <DashboardStat
          label="Vendues"
          value={String(soldCount)}
          detail="ventes terminées"
        />
        <DashboardStat
          label="Gagné"
          value={earnedAmount}
          detail="total vendu"
        />
      </div>

      <div className="mt-6 rounded-lg border border-base-300 bg-base-100 p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold">Ventes du dernier mois</h3>
            <p className="text-sm text-base-content/60">
              {soldCount} vente(s) au total
            </p>
          </div>
          <span className="badge badge-primary badge-outline">30 jours</span>
        </div>
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart
              data={chartData}
              margin={{ bottom: 0, left: -24, right: 8, top: 8 }}
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(var(--p))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(var(--p))"
                    stopOpacity={0.03}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="oklch(var(--bc) / 0.10)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: "oklch(var(--bc) / 0.60)", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tick={{ fill: "oklch(var(--bc) / 0.60)", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(var(--b1))",
                  border: "1px solid oklch(var(--b3))",
                  borderRadius: 8,
                  boxShadow: "0 12px 30px oklch(var(--bc) / 0.12)",
                }}
                formatter={(value) => [`${value} vente(s)`, "Ventes"]}
                labelStyle={{ color: "oklch(var(--bc) / 0.70)" }}
              />
              <Area
                activeDot={{ r: 5, strokeWidth: 0 }}
                dataKey="ventes"
                fill="url(#salesGradient)"
                stroke="oklch(var(--p))"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DashboardStat
          label="Favoris"
          value={String(favoriteCount)}
          detail="annonces suivies"
        />
        <DashboardStat
          label="Ratings donnés"
          value={String(ratedCount)}
          detail="avis envoyés"
        />
      </div>
    </section>
  );
}

function DashboardStat({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-5">
      <p className="text-sm text-base-content/60">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-base-content/50">{detail}</p>
    </div>
  );
}
