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
import { updateStaff } from '@/actions/staff'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Staff, Position } from '@/types/database'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'
import { PhotoUpload } from '@/components/shared/photo-upload'

interface EditStaffClientProps {
  staff: Staff
  positions: Position[]
}

export function EditStaffClient({ staff, positions }: EditStaffClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [formData, setFormData] = useState({
    nip: staff.nip || '',
    full_name: staff.full_name,
  })

  function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  function handleNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
    setIsDirty(true)
    const value = e.target.value.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
  }

  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: toTitleCase(value) }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const result = await updateStaff(staff.id, new FormData(e.currentTarget))
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success('Data pegawai berhasil diperbarui')
      router.push('/pegawai')
    }
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesWarning isDirty={isDirty} />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pegawai">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Pegawai</h1>
          <p className="text-slate-600 mt-1">{staff.full_name}</p>
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
                <PhotoUpload 
                  name="photo" 
                  defaultValue={staff.photo_url || undefined} 
                  onChange={() => setIsDirty(true)} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status & Jabatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position_id">Jabatan</Label>
                  <Select name="position_id" defaultValue={staff.position_id || undefined} onValueChange={() => setIsDirty(true)}>
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
                  <Label htmlFor="status">Status Pegawai *</Label>
                  <Select name="status" defaultValue={staff.status} required onValueChange={() => setIsDirty(true)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                      <SelectItem value="retired">Pensiun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="join_date">Tanggal Bergabung *</Label>
                  <Input 
                    id="join_date" 
                    name="join_date" 
                    type="date" 
                    defaultValue={staff.join_date} 
                    required 
                    onChange={() => setIsDirty(true)} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-8 space-y-6">
          {/* Data Identitas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Identitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
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
                  onChange={(e) => {
                    setIsDirty(true)
                    setFormData(prev => ({ ...prev, full_name: e.target.value }))
                  }}
                  onBlur={handleNameBlur}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <Select name="gender" defaultValue={staff.gender} required onValueChange={() => setIsDirty(true)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position_id">Jabatan</Label>
                <Select name="position_id" defaultValue={staff.position_id || undefined}>
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
                <Label htmlFor="status">Status Pegawai *</Label>
                <Select name="status" defaultValue={staff.status} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="retired">Pensiun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="join_date">Tanggal Bergabung *</Label>
                <Input id="join_date" name="join_date" type="date" defaultValue={staff.join_date} required />
              </div>
            </CardContent>
          </Card>

          {/* Data Kontak */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={staff.email || ''} placeholder="budi@sekolah.sch.id" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input id="phone" name="phone" defaultValue={staff.phone || ''} placeholder="08123456789" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea id="address" name="address" defaultValue={staff.address || ''} placeholder="Jl. Pendidikan No. 1" />
              </div>
            </CardContent>
          </Card>

          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
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
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  )
}
