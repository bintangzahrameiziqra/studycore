"use client";

import { useState, useMemo } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

type LaptopRec = {
  id?: string | number;          // optional kalau backend nanti kirim id
  name: string | null;
  brand: string;
  cpu: string;
  ram_gb: number;
  storage_gb: number;
  gpu: string;
  color_gamut: number;
  price: number;
  trend_score: number;
  predicted_price?: number;
};

const BRANDS = ["Acer", "ASUS", "Lenovo", "HP", "MSI", "Apple", "Dell"];
const CPUS = ["Intel i5", "Intel i7", "Intel i9", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1/M2"];
const GPUS = ["Integrated", "NVIDIA GTX 1650", "NVIDIA RTX 3050", "NVIDIA RTX 3060", "NVIDIA RTX 4060"];

// Sesuai permintaan: RAM fixed dan Storage fixed
const RAM_OPTIONS = [4, 8, 16, 32, 64];     // 64 = 64 GB ke atas
const STORAGE_OPTIONS = [256, 512, 1024];   // 1024 = 1 TB

export function RecommendationForm() {
  const [brand, setBrand] = useState("ASUS");
  const [cpu, setCpu] = useState("Intel i7");
  const [ram, setRam] = useState<number>(16);
  const [storage, setStorage] = useState<number>(512);
  const [gpu, setGpu] = useState("NVIDIA RTX 3050");
  const [gamut, setGamut] = useState<number>(100);
  const [budget, setBudget] = useState<number>(15000000);
  const [results, setResults] = useState<LaptopRec[] | null>(null);
  const [loading, setLoading] = useState(false);

  const weights = {
    brand: 0.04,
    cpu: 0.3,
    ram: 0.22,
    storage: 0.1,
    gpu: 0.2,
    color_gamut: 0.08,
    price: 0.06,
  };

  async function onRecommend() {
    setLoading(true);
    try {
      const data = await fetcher<LaptopRec[]>(`${API_BASE_URL}/api/recommend`, {
        method: "POST",
        body: JSON.stringify({
          brand,
          cpu,
          ram_gb: ram,
          storage_gb: storage,
          gpu,
          color_gamut: gamut,
          budget,
          weights,
        }),
      });
      setResults(data);
    } catch (e) {
      console.error("[recommend] error:", e);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  async function onPredict() {
    setLoading(true);
    try {
      const pred = await fetcher<{ predicted_price: number }>(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        body: JSON.stringify({
          brand,
          cpu,
          ram_gb: ram,
          storage_gb: storage,
          gpu,
          color_gamut: gamut,
        }),
      });
      setResults([
        {
          id: "config",
          name: "Konfigurasi Kamu",
          brand,
          cpu,
          ram_gb: ram,
          storage_gb: storage,
          gpu,
          color_gamut: gamut,
          price: budget,
          trend_score: 0.5,
          predicted_price: pred.predicted_price,
        },
      ]);
    } catch (e) {
      console.error("[predict] error:", e);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  // Dedup hasil biar gak bikin key dobel; definisikan signature item
  const deduped = useMemo(() => {
    if (!results) return null;
    const seen = new Set<string>();
    const out: LaptopRec[] = [];
    for (const r of results) {
      const safeName = (r.name?.trim() || `${r.brand} ${r.cpu}`.trim());
      const sig = [
        safeName,
        r.gpu?.trim() || "",
        String(r.ram_gb ?? ""),
        String(r.storage_gb ?? ""),
        String(Math.round(Number(r.price) || 0)),
      ].join("|");
      if (!seen.has(sig)) {
        seen.add(sig);
        out.push(r);
      }
    }
    return out;
  }, [results]);

  // Helper bikin key yang unik + stabil
  const makeKey = (r: LaptopRec, idx: number) => {
    const safeName = (r.name?.trim() || `${r.brand} ${r.cpu}`.trim());
    if (r.id !== undefined && r.id !== null) {
      return `rec|${String(r.id)}`; // kalau backend kasih id, pakai itu saja
    }
    return [
      "rec",
      safeName,
      r.gpu?.trim() || "",
      String(r.ram_gb ?? ""),
      String(r.storage_gb ?? ""),
      String(Math.round(Number(r.price) || 0)),
      idx, // seatbelt anti-duplikat akhir
    ].join("|");
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-primary">Laptop Pilihanmu!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
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

          <div>
            <Label>CPU / Prosesor</Label>
            <Select value={cpu} onValueChange={setCpu}>
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

          {/* RAM: dropdown fixed */}
          <div>
            <Label>RAM</Label>
            <Select value={String(ram)} onValueChange={(v) => setRam(parseInt(v, 10))}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih RAM" />
              </SelectTrigger>
              <SelectContent>
                {RAM_OPTIONS.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r === 64 ? "64 GB+" : `${r} GB`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Storage: dropdown fixed */}
          <div>
            <Label>Penyimpanan</Label>
            <Select value={String(storage)} onValueChange={(v) => setStorage(parseInt(v, 10))}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih penyimpanan" />
              </SelectTrigger>
              <SelectContent>
                {STORAGE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s === 1024 ? "1 TB" : `${s} GB`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>GPU</Label>
            <Select value={gpu} onValueChange={setGpu}>
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

          <div>
            <Label>Color Gamut (%)</Label>
            <Input
              type="number"
              value={gamut}
              onChange={(e) => setGamut(Number.parseInt(e.target.value || "0"))}
            />
          </div>

          <div>
            <Label>Budget Maksimal (Rp)</Label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number.parseInt(e.target.value || "0"))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button disabled={loading} onClick={onRecommend} className="bg-primary hover:opacity-90">
              {loading ? "Memproses..." : "Dapatkan Rekomendasi"}
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={onPredict}
              className="border-primary/40 text-primary hover:bg-primary/10 bg-transparent"
            >
              Prediksi Harga
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Bobot: Brand 4%, CPU 30%, RAM 22%, Storage 10%, GPU 20%, Gamut 8%, Harga 6%
          </p>
        </CardContent>
      </Card>

      <div className="md:col-span-2 space-y-4">
        {!deduped && (
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Rekomendasi Terupdate</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Isi form di kiri untuk mendapatkan rekomendasi sesuai preferensi dan budget kamu.
            </CardContent>
          </Card>
        )}

        {deduped &&
          deduped.map((r, idx) => {
            const safeName = (r.name?.trim() || `${r.brand} ${r.cpu}`.trim());
            const key = makeKey(r, idx);
            const priceNum = Number(r.price) || 0;
            const predNum = typeof r.predicted_price === "number" ? r.predicted_price : NaN;

            return (
              <Card
                key={key}
                className="transition hover:border-primary/50 hover:shadow-md hover:neon-glow"
              >
                <CardHeader className="flex-row items-baseline justify-between">
                  <CardTitle className="text-foreground">{safeName}</CardTitle>
                  <span className="text-sm text-primary/90">Trend: {(r.trend_score * 100).toFixed(0)}%</span>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 text-sm text-muted-foreground md:grid-cols-4">
                  <div>
                    <span className="text-foreground">Brand:</span> {r.brand}
                  </div>
                  <div>
                    <span className="text-foreground">CPU:</span> {r.cpu}
                  </div>
                  <div>
                    <span className="text-foreground">RAM:</span> {r.ram_gb} GB
                  </div>
                  <div>
                    <span className="text-foreground">Storage:</span> {r.storage_gb} GB
                  </div>
                  <div>
                    <span className="text-foreground">GPU:</span> {r.gpu}
                  </div>
                  <div>
                    <span className="text-foreground">Gamut:</span> {r.color_gamut}%
                  </div>
                  <div>
                    <span className="text-foreground">Harga:</span> Rp {priceNum.toLocaleString("id-ID")}
                  </div>
                  {Number.isFinite(predNum) && (
                    <div>
                      <span className="text-foreground">Prediksi Harga:</span>{" "}
                      Rp {Math.round(predNum).toLocaleString("id-ID")}
                    </div>
                  )}
                  <div className="col-span-2 md:col-span-4 mt-2">
                    <Progress
                      value={Math.max(0, Math.min(100, r.trend_score * 100))}
                      className="h-2 bg-secondary/50 [&>div]:bg-primary neon-glow"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
