import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute left-1/2 top-0 -z-10 h-52 w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl neon-glow-pulse" />
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h1 className="text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          StudyCore — Rekomendasi Laptop DKV berbasis AI
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          Temukan laptop yang tepat untuk desain, ilustrasi, dan motion dengan prediksi harga cerdas (Random Forest
          Regression) dan rekomendasi yang sesuai dengan kebutuhanmu!
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/rekomendasi">
            <Button className="group bg-primary text-primary-foreground transition hover:opacity-95 neon-glow">
              <span className="relative">
                Laptop Pilihanmu!
                <span className="absolute -inset-1 -z-10 rounded-md bg-primary/25 blur-sm transition group-hover:bg-primary/35" />
              </span>
            </Button>
          </Link>
          <Link href="/perbandingan">
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 bg-transparent">
              Bandingkan Laptop
            </Button>
          </Link>
        </div>
        <div className="pointer-events-none mt-8 h-2 w-32 rounded bg-primary/40 neon-glow float-slow" />
      </div>
    </section>
  )
}
