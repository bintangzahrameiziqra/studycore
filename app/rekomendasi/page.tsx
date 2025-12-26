import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RecommendationForm } from "@/components/recommendation-form"

export default function RekomendasiPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-primary">Rekomendasi Terupdate</h2>
        <p className="mt-2 text-muted-foreground">
          Dapatkan rekomendasi laptop yang sesuai untuk kebutuhan DKV kamu—rendering, color accuracy, dan mobilitas.
        </p>
        <div className="mt-8">
          <RecommendationForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}
