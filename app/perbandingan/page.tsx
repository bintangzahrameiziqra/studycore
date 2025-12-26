import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CompareForm } from "@/components/compare-form"

export default function PerbandinganPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold text-primary">Perbandingan Laptop</h2>
        <p className="mt-2 text-muted-foreground">
          Bandingkan dua konfigurasi untuk melihat estimasi harga dan keseimbangan spesifikasi.
        </p>
        <div className="mt-8">
          <CompareForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}
