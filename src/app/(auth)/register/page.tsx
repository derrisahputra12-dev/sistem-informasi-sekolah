'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, Mail, Building2, User, MessageSquare, Phone, XCircle, CheckCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [regData, setRegData] = useState<any>(null)
  const [formValues, setFormValues] = useState({
    schoolName: '',
    educationLevel: '',
    fullName: '',
    email: '',
    phone: '',
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await register(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setRegData(result.registration)
      setIsSubmitted(true)
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className="shadow-xl border-0 overflow-hidden">
        <div className="h-2 bg-amber-500 w-full" />
        <CardHeader className="space-y-4 text-center pb-8 pt-10">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Pendaftaran Diproses</CardTitle>
            <CardDescription className="mt-2 text-base">
              Terima kasih! Data pendaftaran sekolah Anda telah kami terima dan sedang dalam antrean verifikasi.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ringkasan Pendaftaran</p>
            <p className="font-medium text-slate-900">{formValues.schoolName}</p>
            <p className="text-sm text-slate-600 font-medium">PIC: {formValues.fullName}</p>
            <p className="text-sm text-slate-600">{formValues.email} • {formValues.phone}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm text-left border border-blue-100 italic">
            "Tim kami akan melakukan pengecekan data. Jika disetujui, detail login akan dikirimkan ke nomor WhatsApp Anda."
          </div>

          <p className="text-sm text-muted-foreground pt-2">
            Proses ini biasanya memakan waktu maksimal 1x24 jam.
          </p>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t py-6">
          <Button asChild variant="outline" className="w-full">
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
          <CardTitle className="text-2xl font-bold">Daftar Sekolah</CardTitle>
          <CardDescription className="mt-2">
            Mulai digitalisasi sekolah Anda sekarang
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
            <Label htmlFor="schoolName">Nama Sekolah</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="schoolName"
                name="schoolName"
                type="text"
                placeholder="SMA Negeri 1 Jakarta"
                required
                className="pl-10"
                value={formValues.schoolName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="educationLevel">Jenjang Pendidikan</Label>
            <Select 
              name="educationLevel" 
              required 
              value={formValues.educationLevel}
              onValueChange={(val) => setFormValues(prev => ({ ...prev, educationLevel: val }))}
            >
              <SelectTrigger className="w-full pl-10 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10">
                   <GraduationCap className="h-4 w-4" />
                </div>
                <SelectValue placeholder="Pilih Jenjang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sd">SD (Sekolah Dasar)</SelectItem>
                <SelectItem value="smp">SMP (Sekolah Menengah Pertama)</SelectItem>
                <SelectItem value="sma">SMA (Sekolah Menengah Atas)</SelectItem>
                <SelectItem value="smk">SMK (Sekolah Menengah Kejuruan)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Dr. Ahmad Sudrajat, M.Pd"
                required
                className="pl-10"
                value={formValues.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@sekolah.sch.id"
                required
                className="pl-10"
                value={formValues.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="081234567890"
                required
                className="pl-10"
                value={formValues.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 mt-8">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Daftar Sekarang
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

