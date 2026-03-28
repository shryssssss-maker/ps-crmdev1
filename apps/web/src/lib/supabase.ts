import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "../types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

try {
  const host = new URL(supabaseUrl).host
  if (typeof window !== "undefined") {
    console.info("[SUPABASE][CLIENT_INIT]", {
      host,
      anonKeyPresent: Boolean(supabaseAnonKey),
    })
  }
} catch {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is malformed")
}

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)
