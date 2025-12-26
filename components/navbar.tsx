"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Beranda" },
  { href: "/rekomendasi", label: "Rekomendasi" },
  { href: "/perbandingan", label: "Perbandingan" },
  { href: "/tentang", label: "Tentang" },
]

export function Navbar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/90 ring-2 ring-primary/40 transition-all group-hover:scale-125 neon-glow" />
          <span className="text-lg font-semibold tracking-wide text-primary group-hover:neon-glow">StudyCore</span>
        </Link>
        <ul className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary",
                    active ? "text-primary neon-glow" : "text-muted-foreground",
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="pointer-events-none absolute inset-x-2 -bottom-px h-0.5 rounded bg-primary/80 neon-glow-pulse" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
