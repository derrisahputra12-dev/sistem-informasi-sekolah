'use client'

import Link from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable } from '@/components/shared/data-table'
import { deleteStaff } from '@/actions/staff'
import { Eye, Trash2, Loader2, Plus, Edit } from 'lucide-react'
import type { Staff, User } from '@/types/database'
import { toast } from 'sonner'

interface StaffWithPosition extends Staff {
  positions?: { name: string } | null
}

interface StaffClientProps {
  data: StaffWithPosition[]
  user: User | null
}

export function StaffClient({ data, user }: StaffClientProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus data pegawai ini?')) return

    setDeleting(id)
    const result = await deleteStaff(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Pegawai berhasil dihapus')
    }
  }

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-600',
    retired: 'bg-amber-100 text-amber-700',
  }

  const statusLabel: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    retired: 'Pensiun',
  }

  const columns = React.useMemo(() => [
    {
      key: 'photo',
      header: '',
      className: 'w-[50px]',
      cell: (row: StaffWithPosition) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.photo_url || undefined} />
          <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
            {row.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    },
    { key: 'nip', header: 'NIP', className: 'w-[150px]', cell: (row: StaffWithPosition) => row.nip || '-' },
    { key: 'full_name', header: 'Nama Lengkap' },
    { 
      key: 'gender', 
      header: 'Jenis Kelamin',
      className: 'w-[100px]',
      cell: (row: StaffWithPosition) => row.gender === 'male' ? 'Laki-laki' : 'Perempuan'
    },
    { 
      key: 'position', 
      header: 'Jabatan',
      cell: (row: StaffWithPosition) => row.positions?.name || '-'
    },
    { key: 'phone', header: 'No. HP', cell: (row: StaffWithPosition) => row.phone || '-' },
    {
      key: 'status',
      header: 'Status',
      cell: (row: StaffWithPosition) => (
        <Badge variant="secondary" className={statusColor[row.status]}>
          {statusLabel[row.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[120px]',
      cell: (row: StaffWithPosition) => (
        <div className="flex items-center gap-1">
          {user?.role === 'super_admin' && (
            <Button asChild variant="ghost" size="icon-sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link href={`/pegawai/${row.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
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
    },
  ], [deleting, user?.role])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Pegawai</h1>
          <p className="text-slate-600 mt-1">Kelola data pegawai sekolah</p>
        </div>
        <Button asChild>
          <Link href="/pegawai/tambah">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pegawai
          </Link>
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchKey="full_name"
        searchPlaceholder="Cari nama pegawai..."
        emptyMessage="Belum ada data pegawai"
      />
    </div>
  )
}

