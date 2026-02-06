'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await forgotPassword(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Cek Email Anda</CardTitle>
            <CardDescription className="mt-2 text-base text-slate-600">
              Kami telah mengirimkan instruksi pemulihan kata sandi ke email Anda. Silakan klik tombol di email tersebut untuk melanjutkan.
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full h-12">
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </CardFooter>
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
          <CardTitle className="text-2xl font-bold">Lupa Password?</CardTitle>
          <CardDescription className="mt-2 text-base text-slate-600">
            Masukkan email Anda untuk mendapatkan tautan atur ulang kata sandi
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 italic">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base text-slate-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@sekolah.sch.id"
                required
                className="pl-10 h-12 text-base border-slate-200 focus:border-primary"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 mt-6">
          <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-primary/20" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Link Reset
          </Button>
          
          <Link 
            href="/login" 
            className="text-sm flex items-center justify-center gap-2 text-slate-500 hover:text-primary transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
