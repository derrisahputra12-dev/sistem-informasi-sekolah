'use client'

import Link from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable } from '@/components/shared/data-table'
import { deleteStudent, promoteStudentsToAlumni } from '@/actions/students'
import { Eye, Trash2, Loader2, Plus, GraduationCap } from 'lucide-react'
import { STUDENT_STATUS, GENDERS } from '@/lib/constants'
import type { Student } from '@/types/database'
import { toast } from 'sonner'

interface StudentsClientProps {
  data: Student[]
  graduatingCount: number
}

export function StudentsClient({ data, graduatingCount }: StudentsClientProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [promoting, setPromoting] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus data siswa ini?')) return

    setDeleting(id)
    const result = await deleteStudent(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Siswa berhasil dihapus')
    }
  }

  async function handlePromote() {
    if (!confirm('Pindahkan semua siswa yang sudah melewati masa studi ke daftar Alumni?')) return

    setPromoting(true)
    const result = await promoteStudentsToAlumni()
    setPromoting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`${result.count} siswa berhasil dipindahkan ke Alumni`)
    }
  }

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    graduated: 'bg-blue-100 text-blue-700',
    transferred: 'bg-amber-100 text-amber-700',
    dropped: 'bg-red-100 text-red-700',
  }

  const columns = React.useMemo(() => [
    {
      key: 'photo',
      header: '',
      className: 'w-[50px]',
      cell: (row: Student) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.photo_url || undefined} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {row.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    },
    { key: 'nisn', header: 'NISN', className: 'w-[120px]' },
    { key: 'nis', header: 'NIS', className: 'w-[100px]' },
    { key: 'full_name', header: 'Nama Lengkap' },
    { 
      key: 'gender', 
      header: 'Jenis Kelamin',
      className: 'w-[100px]',
      cell: (row: Student) => row.gender === 'male' ? 'Laki-laki' : 'Perempuan'
    },
    {
      key: 'status',
      header: 'Kategori',
      cell: (row: Student) => {
        const now = new Date()
        const taStartYear = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1
        
        let label: string = STUDENT_STATUS[row.status as keyof typeof STUDENT_STATUS]
        let colorClass = statusColor[row.status]
        
        if (row.status === 'active') {
          if (row.admission_year === taStartYear) {
            if (row.enrollment_type === 'new') {
              label = 'Siswa Baru'
              colorClass = 'bg-blue-100 text-blue-700'
            } else if (row.enrollment_type === 'transfer') {
              label = 'Pindahan'
              colorClass = 'bg-purple-100 text-purple-700'
            }
          } else {
            label = 'Siswa Aktif'
            colorClass = 'bg-green-100 text-green-700'
          }
        }
        
        return (
          <Badge variant="secondary" className={colorClass}>
            {label}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[100px]',
      cell: (row: Student) => (
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/siswa/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
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
    },
  ], [deleting])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const ta = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Siswa</h1>
          <p className="text-slate-600 mt-1">
            Tahun Ajaran {ta}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePromote}
            disabled={promoting}
            className="text-primary border-primary hover:bg-primary/5"
          >
            {promoting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GraduationCap className="h-4 w-4 mr-2" />
            )}
            Luluskan Siswa Lama ({graduatingCount})
          </Button>
          <Button asChild>
            <Link href="/siswa/tambah">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Siswa
            </Link>
          </Button>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchKey="full_name"
        searchPlaceholder="Cari nama siswa..."
        emptyMessage="Belum ada data siswa"
      />
    </div>
  )
}
