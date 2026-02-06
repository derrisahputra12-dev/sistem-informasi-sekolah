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
import { DataTable } from '@/components/shared/data-table'
import { createPosition, deletePosition } from '@/actions/master-data'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { Position } from '@/types/database'
import { toast } from 'sonner'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'

interface PositionsClientProps {
  data: Position[]
}

export function PositionsClient({ data }: PositionsClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleOpenChange(newOpen: boolean, skipConfirm = false) {
    if (!newOpen && isDirty && !skipConfirm) {
      if (!confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin menutup?')) {
        return
      }
    }
    setOpen(newOpen)
    if (!newOpen) {
      setName('')
      setDescription('')
      setIsDirty(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await createPosition(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success('Jabatan berhasil ditambahkan')
      handleOpenChange(false, true)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus jabatan ini?')) return

    setDeleting(id)
    const result = await deletePosition(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Jabatan berhasil dihapus')
    }
  }

  const columns = [
    { key: 'name', header: 'Nama Jabatan' },
    { key: 'description', header: 'Deskripsi', cell: (row: Position) => row.description || '-' },
    {
      key: 'actions',
      header: 'Aksi',
      cell: (row: Position) => (
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
          <h1 className="text-2xl font-bold text-slate-900">Jabatan</h1>
          <p className="text-slate-600 mt-1">Kelola data jabatan pegawai</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDirty(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jabatan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Jabatan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Jabatan</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Kepala Sekolah" 
                  required 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setIsDirty(true)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Deskripsi jabatan (opsional)"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setIsDirty(true)
                  }}
                />
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
        searchPlaceholder="Cari jabatan..."
        emptyMessage="Belum ada jabatan"
      />
    </div>
  )
}

