'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createStaff } from '@/actions/staff'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Position } from '@/types/database'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'
import { PhotoUpload } from '@/components/shared/photo-upload'

interface AddStaffPageClientProps {
  positions: Position[]
}

export function AddStaffPageClient({ positions }: AddStaffPageClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [formData, setFormData] = useState({
    nip: '',
    full_name: '',
  })

  function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  function handleNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
    setIsDirty(true)
    const value = e.target.value.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setIsDirty(true)
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: toTitleCase(value) }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const result = await createStaff(new FormData(e.currentTarget))
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success('Pegawai berhasil ditambahkan')
      router.push('/pegawai')
    }
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesWarning isDirty={isDirty} />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pegawai" onClick={(e) => {
            if (isDirty && !confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin kembali?')) {
              e.preventDefault()
            }
          }}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Pegawai Baru</h1>
          <p className="text-slate-600 mt-1">Pendaftaran pegawai baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Photo */}
          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Foto Pegawai</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <PhotoUpload name="photo" onChange={() => setIsDirty(true)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status & Jabatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position_id">Jabatan (Opsional)</Label>
                  <Select name="position_id" onValueChange={() => setIsDirty(true)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jabatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="join_date">Tanggal Bergabung *</Label>
                  <Input 
                    id="join_date" 
                    name="join_date" 
                    type="date" 
                    required 
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Main Data */}
          <div className="md:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Identitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP (Opsional)</Label>
                  <Input 
                    id="nip" 
                    name="nip" 
                    placeholder="197001011990011001" 
                    value={formData.nip}
                    onChange={handleNumberInput}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap *</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    placeholder="Drs. Budi Santoso, M.Pd" 
                    required 
                    value={formData.full_name}
                    onChange={handleChange}
                    onBlur={handleNameBlur}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin *</Label>
                  <Select name="gender" required onValueChange={() => setIsDirty(true)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Laki-laki</SelectItem>
                      <SelectItem value="female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Opsional)</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="budi@sekolah.sch.id" 
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">No. HP (Opsional)</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      placeholder="08123456789" 
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat (Opsional)</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    placeholder="Jl. Pendidikan No. 1" 
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/pegawai" onClick={(e) => {
                  if (isDirty && !confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin batal?')) {
                    e.preventDefault()
                  }
                }}>Batal</Link>
              </Button>
              <Button type="submit" disabled={loading} className="px-8 font-semibold">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}


