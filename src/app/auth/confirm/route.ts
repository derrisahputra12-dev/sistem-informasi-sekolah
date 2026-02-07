import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Get parameters from URL
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'recovery' | 'email' | 'signup' | null
  const next = searchParams.get('next') ?? '/'

  // If we have a token_hash and type, verify it
  if (token_hash && type) {
    const cookieStore = await cookies()
    
    // Collect cookies to set on the response
    const cookiesToSet: { name: string; value: string; options: any }[] = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies)
            try {
              cookies.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Expected in Route Handlers
            }
          },
        },
      }
    )
    
    // Verify the OTP token - this establishes the session
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Create redirect response
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Apply cookies to response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      
      console.log('Token verified successfully, redirecting to:', next)
      return response
    }
    
    console.error('Token verification error:', error.message)
  }

  // Redirect to login with error if verification failed
  return NextResponse.redirect(`${origin}/login?error=Tautan tidak valid atau sudah kedaluwarsa`)
}
