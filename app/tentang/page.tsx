import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TentangPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Tentang StudyCore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              StudyCore adalah sistem rekomendasi laptop untuk mahasiswa DKV yang memanfaatkan Machine Learning (Random
              Forest Regression) untuk memprediksi harga dan memberi saran berdasarkan spesifikasi yang relevan dengan
              kebutuhan desain: Processor (CPU), RAM, GPU (dedicated / tipe), Storage (kapasitas + SSD vs HDD), Ukuran layar / kualitas panel, Brand, dan Budget.
            </p>
            <p>
              Alasan dibangun: membantu mahasiswa memilih perangkat yang seimbang antara performa, kapasitas, dan
              budget. Sistem ini menggunakan dataset laptop, memproses fitur kategorikal dan numerik, serta menghasilkan
              rekomendasi berbobot sesuai preferensi pengguna.
            </p>
            <p>Catatan: Hasil prediksi bersifat estimasi. Silakan gunakan sebagai referensi awal sebelum membeli.</p>
          </CardContent>
        </Card>
      </section>
      <Footer />
    </main>
  )
}
