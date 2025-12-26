import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { StatsStrip } from "@/components/stats-strip"
import { FeatureCards } from "@/components/feature-cards"

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsStrip />
      <FeatureCards />
      <Footer />
    </main>
  )
}
