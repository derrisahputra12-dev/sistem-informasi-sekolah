'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { createLetter, deleteLetter } from '@/actions/staff'
import { Plus, Trash2, Loader2, Mail, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import type { Letter } from '@/types/database'
import { toast } from 'sonner'

interface LettersClientProps {
  data: Letter[]
}

export function LettersClient({ data }: LettersClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createLetter(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Surat berhasil ditambahkan')
      setOpen(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus surat ini?')) return

    setDeleting(id)
    const result = await deleteLetter(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Surat berhasil dihapus')
    }
  }

  const columns = [
    {
      key: 'type',
      header: '',
      className: 'w-[40px]',
      cell: (row: Letter) => (
        row.type === 'incoming' 
          ? <ArrowDownLeft className="h-4 w-4 text-blue-600" />
          : <ArrowUpRight className="h-4 w-4 text-emerald-600" />
      ),
    },
    { key: 'letter_number', header: 'No. Surat' },
    { key: 'subject', header: 'Perihal' },
    { 
      key: 'sender_recipient', 
      header: 'Pengirim/Penerima',
      cell: (row: Letter) => row.type === 'incoming' ? row.sender : row.recipient || '-'
    },
    { 
      key: 'date', 
      header: 'Tanggal',
      cell: (row: Letter) => new Date(row.date).toLocaleDateString('id-ID')
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Letter) => (
        <Badge variant="secondary" className={
          row.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }>
          {row.status === 'processed' ? 'Diproses' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[80px]',
      cell: (row: Letter) => (
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
          <h1 className="text-2xl font-bold text-slate-900">Surat Masuk/Keluar</h1>
          <p className="text-slate-600 mt-1">Kelola surat menyurat sekolah</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Surat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Surat</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Jenis Surat *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incoming">Surat Masuk</SelectItem>
                      <SelectItem value="outgoing">Surat Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal *</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="letter_number">No. Surat *</Label>
                <Input id="letter_number" name="letter_number" placeholder="001/SK/2024" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Perihal *</Label>
                <Input id="subject" name="subject" placeholder="Undangan Rapat" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender">Pengirim (Opsional)</Label>
                  <Input id="sender" name="sender" placeholder="Dinas Pendidikan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Penerima (Opsional)</Label>
                  <Input id="recipient" name="recipient" placeholder="Kepala Sekolah" />
                </div>
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
        searchKey="subject"
        searchPlaceholder="Cari perihal surat..."
        emptyMessage="Belum ada surat"
      />
    </div>
  )
}
