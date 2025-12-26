export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-balance text-center text-sm text-muted-foreground">
          {"Sudah dapatkah laptop impian sesuai budget dan kebutuhan?"}
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} StudyCore — Sistem Rekomendasi Laptop untuk Mahasiswa DKV.
        </p>
      </div>
    </footer>
  )
}
