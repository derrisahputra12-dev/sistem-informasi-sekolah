'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { createExtracurricular, deleteExtracurricular } from '@/actions/raport'
import { Plus, Trash2, Loader2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { Staff } from '@/types/database'

interface ExtracurricularWithRelations {
  id: string
  name: string
  description: string | null
  schedule: string | null
  staff?: { full_name: string } | null
}

interface EskulClientProps {
  data: ExtracurricularWithRelations[]
  staff: Staff[]
}

export function EskulClient({ data, staff }: EskulClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createExtracurricular(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Ekstrakurikuler berhasil ditambahkan')
      setOpen(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus ekstrakurikuler ini?')) return

    setDeleting(id)
    const result = await deleteExtracurricular(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Ekstrakurikuler berhasil dihapus')
    }
  }

  const columns = [
    { 
      key: 'name', 
      header: 'Nama Kegiatan',
      cell: (row: ExtracurricularWithRelations) => (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    { key: 'description', header: 'Deskripsi', cell: (row: ExtracurricularWithRelations) => row.description || '-' },
    { 
      key: 'coach', 
      header: 'Pembina',
      cell: (row: ExtracurricularWithRelations) => row.staff?.full_name || '-'
    },
    { key: 'schedule', header: 'Jadwal', cell: (row: ExtracurricularWithRelations) => row.schedule || '-' },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[100px]',
      cell: (row: ExtracurricularWithRelations) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.id)}
          disabled={deleting === row.id}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          {deleting === row.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ekstrakurikuler</h1>
          <p className="text-slate-600 mt-1">Kelola data kegiatan ekstrakurikuler</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Eskul
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Ekstrakurikuler</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kegiatan *</Label>
                <Input id="name" name="name" placeholder="Pramuka" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" name="description" placeholder="Deskripsi kegiatan..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coach_id">Pembina</Label>
                <Select name="coach_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pembina" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Jadwal</Label>
                <Input id="schedule" name="schedule" placeholder="Jumat, 15:00 WIB" />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari eskul..."
        emptyMessage="Belum ada data ekstrakurikuler"
      />
    </div>
  )
}
