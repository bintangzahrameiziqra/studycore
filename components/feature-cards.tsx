import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Prediksi Harga Cerdas",
    desc: "Algoritma Random Forest Regression memprediksi harga berdasar spesifikasi.",
  },
  {
    title: "Rekomendasi Berbobot",
    desc: "Bobot preferensi: Brand 4%, CPU 30%, RAM 22%, Storage 10%, GPU 20%, Gamut 8%, Harga 6%.",
  },
  { title: "Trend & Update", desc: "Pantau rekomendasi ter-update beserta tren harga dan spesifikasi populer." },
  {
    title: "Perbandingan Mudah",
    desc: "Bandingkan dua laptop untuk melihat spesifikasi dan estimasi harga berdampingan.",
  },
]

export function FeatureCards() {
  return (
    <section className="mx-auto mt-12 max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {features.map((f) => (
          <Card
            key={f.title}
            className="transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md hover:neon-glow"
          >
            <CardHeader>
              <CardTitle className="text-primary">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
