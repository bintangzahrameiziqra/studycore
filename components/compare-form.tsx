"use client"

import { useState } from "react"
import { API_BASE_URL } from "@/lib/constants"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const BRANDS = ["Acer", "ASUS", "Lenovo", "HP", "MSI", "Apple", "Dell"]
const CPUS = ["Intel i5", "Intel i7", "Intel i9", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1/M2"]
const GPUS = ["Integrated", "NVIDIA GTX 1650", "NVIDIA RTX 3050", "NVIDIA RTX 3060", "NVIDIA RTX 4060"]

type CompareResult = {
  a: { predicted_price: number }
  b: { predicted_price: number }
  diff: number
}

export function CompareForm() {
  const [a, setA] = useState({
    brand: "ASUS",
    cpu: "Intel i7",
    ram_gb: 16,
    storage_gb: 512,
    gpu: "NVIDIA RTX 3050",
    color_gamut: 100,
  })
  const [b, setB] = useState({
    brand: "Lenovo",
    cpu: "AMD Ryzen 7",
    ram_gb: 16,
    storage_gb: 512,
    gpu: "NVIDIA RTX 3060",
    color_gamut: 100,
  })
  const [res, setRes] = useState<CompareResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function onCompare() {
    setLoading(true)
    try {
      const data = await fetcher<CompareResult>(`${API_BASE_URL}/api/compare`, {
        method: "POST",
        body: JSON.stringify({ a, b }),
      })
      setRes(data)
    } catch (e) {
      console.error("[v0] compare error:", e)
      setRes(null)
    } finally {
      setLoading(false)
    }
  }

  function Section({ title, value, onChange }: any) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="col-span-2">
            <Label>Brand</Label>
            <Select value={value.brand} onValueChange={(v) => onChange({ ...value, brand: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih brand" />
              </SelectTrigger>
              <SelectContent>
                {BRANDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>CPU</Label>
            <Select value={value.cpu} onValueChange={(v) => onChange({ ...value, cpu: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih CPU" />
              </SelectTrigger>
              <SelectContent>
                {CPUS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>RAM (GB)</Label>
            <Input
              type="number"
              value={value.ram_gb}
              onChange={(e) => onChange({ ...value, ram_gb: Number.parseInt(e.target.value || "0") })}
            />
          </div>
          <div>
            <Label>Storage (GB)</Label>
            <Input
              type="number"
              value={value.storage_gb}
              onChange={(e) => onChange({ ...value, storage_gb: Number.parseInt(e.target.value || "0") })}
            />
          </div>
          <div className="col-span-2">
            <Label>GPU</Label>
            <Select value={value.gpu} onValueChange={(v) => onChange({ ...value, gpu: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih GPU" />
              </SelectTrigger>
              <SelectContent>
                {GPUS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Color Gamut (%)</Label>
            <Input
              type="number"
              value={value.color_gamut}
              onChange={(e) => onChange({ ...value, color_gamut: Number.parseInt(e.target.value || "0") })}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Laptop A" value={a} onChange={setA} />
        <Section title="Laptop B" value={b} onChange={setB} />
      </div>
      <div className="flex justify-end">
        <Button onClick={onCompare} disabled={loading} className="bg-primary hover:opacity-90">
          {loading ? "Membandingkan..." : "Bandingkan"}
        </Button>
      </div>
      {res && (
        <Card className="border-primary/40 hover:neon-glow transition">
          <CardHeader>
            <CardTitle>Hasil Perbandingan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4 hover:neon-glow transition">
              <p className="text-xs uppercase text-muted-foreground">Prediksi A</p>
              <p className="mt-1 text-xl font-semibold text-primary">
                Rp {Math.round(res.a.predicted_price).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 hover:neon-glow transition">
              <p className="text-xs uppercase text-muted-foreground">Prediksi B</p>
              <p className="mt-1 text-xl font-semibold text-primary">
                Rp {Math.round(res.b.predicted_price).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 hover:neon-glow transition">
              <p className="text-xs uppercase text-muted-foreground">Selisih</p>
              <p className="mt-1 text-xl font-semibold text-primary">
                Rp {Math.round(res.diff).toLocaleString("id-ID")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
