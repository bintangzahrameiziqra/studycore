"use client"

import useSWR from "swr"
import { API_BASE_URL } from "@/lib/constants"
import { fetcher } from "@/lib/fetcher"

type Metrics = {
  dataset_count: number
  model_r2: number
  model_rmse: number
}

export function StatsStrip() {
  const { data, error, isLoading } = useSWR<Metrics>(`${API_BASE_URL}/api/metrics`, fetcher)

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-lg border bg-card p-5 transition hover:shadow-md hover:neon-glow">
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary neon-glow-pulse" />
          <p className="text-xs uppercase text-muted-foreground">Jumlah Dataset</p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {isLoading ? "..." : error ? "—" : data?.dataset_count}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-lg border bg-card p-5 transition hover:shadow-md hover:neon-glow">
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary neon-glow-pulse" />
          <p className="text-xs uppercase text-muted-foreground">Akurasi Harga (R²)</p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {isLoading ? "..." : error ? "—" : (data?.model_r2 ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-lg border bg-card p-5 transition hover:shadow-md hover:neon-glow">
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary neon-glow-pulse" />
          <p className="text-xs uppercase text-muted-foreground">RMSE</p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {isLoading ? "..." : error ? "—" : (data?.model_rmse ?? 0).toFixed(0)}
          </p>
        </div>
      </div>
    </section>
  )
}
