export async function fetcher<T = any>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
