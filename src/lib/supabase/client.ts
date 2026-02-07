import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time on Vercel, these might be missing. 
  // We provide fallbacks to prevent the build from crashing.
  return createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}

