'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/shared/data-table'
import { createVocationalProgram, deleteVocationalProgram, updateVocationalProgram } from '@/actions/master-data'
import { Plus, Trash2, Loader2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'

export interface VocationalProgram {
  id: string
  name: string
  code: string
  description: string | null
}

interface JurusanClientProps {
  data: VocationalProgram[]
}

export function JurusanClient({ data }: JurusanClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')

  function handleOpenChange(newOpen: boolean, skipConfirm = false) {
    if (!newOpen && isDirty && !skipConfirm) {
      if (!confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin menutup?')) {
        return
      }
    }
    setOpen(newOpen)
    if (!newOpen) {
      setEditingId(null)
      setName('')
      setCode('')
      setDescription('')
      setIsDirty(false)
    }
  }

  function handleEdit(program: VocationalProgram) {
    setEditingId(program.id)
    setName(program.name)
    setCode(program.code)
    setDescription(program.description || '')
    setOpen(true)
    setIsDirty(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData()
    formData.append('name', name)
    formData.append('code', code)
    if (description) formData.append('description', description)

    const result = editingId 
      ? await updateVocationalProgram(editingId, formData)
      : await createVocationalProgram(formData)
      
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success(editingId ? 'Jurusan berhasil diperbarui' : 'Jurusan berhasil ditambahkan')
      handleOpenChange(false, true)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus jurusan ini?')) return

    setDeleting(id)
    const result = await deleteVocationalProgram(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Jurusan berhasil dihapus')
    }
  }

  const columns = [
    { key: 'code', header: 'Kode', className: 'w-[100px]' },
    { key: 'name', header: 'Nama Jurusan' },
    { key: 'description', header: 'Keterangan' },
    {
      key: 'actions',
      header: 'Aksi',
      cell: (row: VocationalProgram) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
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
        </div>
      ),
      className: 'w-[120px]'
    }
  ]

  return (
    <div className="space-y-6">
      <UnsavedChangesWarning isDirty={isDirty} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jurusan</h1>
          <p className="text-slate-600 mt-1">Kelola data kompetensi keahlian</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDirty(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jurusan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Jurusan' : 'Tambah Jurusan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode Jurusan</Label>
                  <Input 
                    id="code"
                    placeholder="RPL" 
                    required 
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase())
                      setIsDirty(true)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Jurusan</Label>
                  <Input 
                    id="name"
                    placeholder="Rekayasa Perangkat Lunak" 
                    required 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setIsDirty(true)
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Keterangan (Opsional)</Label>
                <Input 
                  id="description"
                  placeholder="Keterangan tambahan..." 
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setIsDirty(true)
                  }}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari jurusan..."
        emptyMessage="Belum ada data jurusan"
      />
    </div>
  )
}
