'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [sessionValid, setSessionValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Password strength validation
  const passwordChecks = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
  const isPasswordStrong = passwordChecks.minLength && passwordChecks.hasLetter && passwordChecks.hasNumber

  // Check for valid session on mount
  // Session should already be established by /auth/confirm route
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Small delay to ensure session is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Session found:', session.user.email)
          setSessionValid(true)
        } else {
          console.log('No session found')
          setSessionValid(false)
        }
      } catch (err) {
        console.error('Error checking session:', err)
        setSessionValid(false)
      } finally {
        setCheckingSession(false)
      }
    }

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        setSessionValid(true)
        setCheckingSession(false)
      }
    })

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Password validation
    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter')
      setLoading(false)
      return
    }

    if (!/[a-zA-Z]/.test(password)) {
      setError('Password harus mengandung minimal satu huruf')
      setLoading(false)
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password harus mengandung minimal satu angka')
      setLoading(false)
      return
    }
    
    // Use Server Action for better security
    const result = await resetPassword(formData)
    
    if (result?.error) {
      // Provide user-friendly error messages
      if (result.error.includes('session')) {
        setError('Sesi tidak valid atau sudah kedaluwarsa. Silakan minta link reset password baru.')
      } else {
        setError(result.error)
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Final sign out to clear current session after successful reset
      await supabase.auth.signOut()
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  // Loading state while checking session
  if (checkingSession) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Memverifikasi Sesi...</CardTitle>
            <CardDescription className="mt-2">
              Mohon tunggu sebentar
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // Session invalid - show error
  if (!sessionValid) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-red-600">Sesi Tidak Valid</CardTitle>
            <CardDescription className="mt-2 text-base">
              Tautan reset password sudah kedaluwarsa atau tidak valid. Silakan minta link reset password baru.
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Minta Link Baru</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Success state
  if (success) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Password Berhasil Diubah</CardTitle>
            <CardDescription className="mt-2 text-base">
              Password Anda telah berhasil diperbarui. Mengalihkan ke halaman login...
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-4 text-center pb-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Setel Ulang Password</CardTitle>
          <CardDescription className="mt-2">
            Masukkan password baru Anda di bawah ini
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="space-y-1 pt-2 text-xs">
                <div className={`flex items-center gap-2 ${passwordChecks.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordChecks.minLength ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                  Minimal 8 karakter
                </div>
                <div className={`flex items-center gap-2 ${passwordChecks.hasLetter ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordChecks.hasLetter ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                  Mengandung huruf
                </div>
                <div className={`flex items-center gap-2 ${passwordChecks.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordChecks.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                  Mengandung angka
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 mt-8">
          <Button type="submit" className="w-full" disabled={loading || !isPasswordStrong}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Password Baru
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
