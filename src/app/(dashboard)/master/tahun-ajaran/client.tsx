'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/shared/data-table'
import { createAcademicYear, deleteAcademicYear } from '@/actions/master-data'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { AcademicYear } from '@/types/database'
import { toast } from 'sonner'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'

interface AcademicYearsClientProps {
  data: AcademicYear[]
}

export function AcademicYearsClient({ data }: AcademicYearsClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(false)

  function handleOpenChange(newOpen: boolean, skipConfirm = false) {
    if (!newOpen && isDirty && !skipConfirm) {
      if (!confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin menutup?')) {
        return
      }
    }
    setOpen(newOpen)
    if (!newOpen) {
      setName('')
      setStartDate('')
      setEndDate('')
      setIsActive(false)
      setIsDirty(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await createAcademicYear(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success('Tahun ajaran berhasil ditambahkan')
      handleOpenChange(false, true)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus tahun ajaran ini?')) return

    setDeleting(id)
    const result = await deleteAcademicYear(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Tahun ajaran berhasil dihapus')
    }
  }

  const columns = [
    { key: 'name', header: 'Nama Tahun Ajaran' },
    { 
      key: 'start_date', 
      header: 'Tanggal Mulai',
      cell: (row: AcademicYear) => new Date(row.start_date).toLocaleDateString('id-ID')
    },
    { 
      key: 'end_date', 
      header: 'Tanggal Selesai',
      cell: (row: AcademicYear) => new Date(row.end_date).toLocaleDateString('id-ID')
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (row: AcademicYear) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {row.is_active ? 'Aktif' : 'Tidak Aktif'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      cell: (row: AcademicYear) => (
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
      className: 'w-[80px]'
    }
  ]

  return (
    <div className="space-y-6">
      <UnsavedChangesWarning isDirty={isDirty} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tahun Ajaran</h1>
          <p className="text-slate-600 mt-1">Kelola data tahun ajaran sekolah</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDirty(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tahun Ajaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tahun Ajaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Tahun Ajaran</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="2024/2025"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setIsDirty(true)
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Tanggal Mulai</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setIsDirty(true)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Tanggal Selesai</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setIsDirty(true)
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_active" 
                  name="is_active" 
                  value="true" 
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    setIsActive(!!checked)
                    setIsDirty(true)
                  }}
                />
                <Label htmlFor="is_active" className="font-normal">
                  Jadikan tahun ajaran aktif
                </Label>
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
        searchPlaceholder="Cari tahun ajaran..."
        emptyMessage="Belum ada tahun ajaran"
      />
    </div>
  )
}
