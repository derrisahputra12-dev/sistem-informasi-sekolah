'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotoUpload } from '@/components/shared/photo-upload'
import { updateSchoolProfile } from '@/actions/settings'
import { Loader2, Save, School as SchoolIcon, Palette, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import type { User, School } from '@/types/database'

export function SettingsClient({ initialUser }: { initialUser: User & { schools: School | null } | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const user = initialUser
  if (!user?.schools) return null
  const school = user.schools as School

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateSchoolProfile(formData)
    
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Pengaturan berhasil diperbarui')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-slate-600 mt-1">Kelola konfigurasi sistem dan informasi sekolah</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <SchoolIcon className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Keamanan
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="profile" className="space-y-6 pt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Informasi Sekolah</CardTitle>
                <CardDescription>Informasi dasar mengenai intansi sekolah Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Sekolah</Label>
                  <Input id="name" name="name" defaultValue={school.name} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Sekolah</Label>
                    <Input id="email" name="email" type="email" defaultValue={school.email || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input id="phone" name="phone" defaultValue={school.phone || ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea id="address" name="address" defaultValue={school.address || ''} rows={3} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6 pt-6">
            <div className="flex justify-center">
              <Card className="border-0 shadow-sm w-full max-w-md">
                <CardHeader>
                  <CardTitle>Logo Sekolah</CardTitle>
                  <CardDescription>Logo ini akan muncul di sidebar, laporan, dan tab browser (favicon)</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6">
                  <PhotoUpload 
                    name="logo" 
                    defaultValue={school.logo_url || undefined} 
                  />
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Gunakan logo dengan latar belakang transparan. 
                    Sistem akan otomatis menyesuaikannya.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 pt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>Pengaturan akses dan keamanan sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 italic">Fitur manajemen keamanan tambahan akan segera tersedia.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="px-8 font-semibold">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
