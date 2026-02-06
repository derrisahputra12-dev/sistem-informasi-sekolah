import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    
    // Create Supabase client with proper cookie handling for route handlers
    // We need to collect cookies to set and apply them to the response
    const cookiesToSet: { name: string; value: string; options: any }[] = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookies) {
            // Collect cookies to be set on the response
            cookiesToSet.push(...cookies)
            // Also try to set on cookie store (may fail in some contexts)
            try {
              cookies.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // This is expected in Route Handlers, we'll set on response instead
            }
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Create redirect response
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // IMPORTANT: Apply collected cookies to the response
      // This ensures the session is properly stored in the browser
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      
      return response
    }
    
    console.error('Auth callback error:', error.message)
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=Autentikasi gagal atau tautan kadaluwarsa`)
}

