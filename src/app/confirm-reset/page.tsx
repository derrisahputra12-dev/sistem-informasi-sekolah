'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Lock, ArrowRight } from 'lucide-react'

function ConfirmResetContent() {
  const searchParams = useSearchParams()
  const targetUrl = searchParams.get('url')

  const handleConfirm = () => {
    if (targetUrl) {
      window.location.href = targetUrl
    }
  }

  if (!targetUrl) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">Link Tidak Valid</CardTitle>
          <CardDescription>Tautan reset password ini tidak valid atau sudah kadaluwarsa.</CardDescription>
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
          <CardTitle className="text-2xl font-bold">Konfirmasi Reset Password</CardTitle>
          <CardDescription className="mt-2 text-base">
            Klik tombol di bawah ini untuk melanjutkan proses penyetelan ulang kata sandi Anda.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground pb-8">
        Halaman ini diperlukan untuk memastikan proses reset password berjalan dengan aman.
      </CardContent>
      <CardFooter>
        <Button onClick={handleConfirm} className="w-full h-12 text-base gap-2">
          Lanjutkan ke Reset Password
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function ConfirmResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle>Memuat...</CardTitle>
            </CardHeader>
          </Card>
        }>
          <ConfirmResetContent />
        </Suspense>
      </div>
    </div>
  )
}
