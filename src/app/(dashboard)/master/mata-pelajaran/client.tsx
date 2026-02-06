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
import { createSubject, deleteSubject } from '@/actions/master-data'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { Subject } from '@/types/database'
import { toast } from 'sonner'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'

interface SubjectsClientProps {
  data: Subject[]
}

export function SubjectsClient({ data }: SubjectsClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
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
      setName('')
      setCode('')
      setDescription('')
      setIsDirty(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await createSubject(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success('Mata pelajaran berhasil ditambahkan')
      handleOpenChange(false, true)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus mata pelajaran ini?')) return

    setDeleting(id)
    const result = await deleteSubject(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Mata pelajaran berhasil dihapus')
    }
  }

  const columns = [
    { key: 'code', header: 'Kode', className: 'w-[100px]' },
    { key: 'name', header: 'Nama Mata Pelajaran' },
    { key: 'description', header: 'Deskripsi', cell: (row: Subject) => row.description || '-' },
    {
      key: 'actions',
      header: 'Aksi',
      cell: (row: Subject) => (
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
          <h1 className="text-2xl font-bold text-slate-900">Mata Pelajaran</h1>
          <p className="text-slate-600 mt-1">Kelola data mata pelajaran sekolah</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDirty(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Mapel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode</Label>
                  <Input 
                    id="code" 
                    name="code" 
                    placeholder="MTK" 
                    required 
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase())
                      setIsDirty(true)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Matematika" 
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
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Deskripsi mata pelajaran (opsional)"
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
        searchPlaceholder="Cari mata pelajaran..."
        emptyMessage="Belum ada mata pelajaran"
      />
    </div>
  )
}

