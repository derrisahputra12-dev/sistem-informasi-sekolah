'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable } from '@/components/shared/data-table'
import { deleteStudent } from '@/actions/students'
import { Eye, Trash2, Loader2, Search } from 'lucide-react'
import { STUDENT_STATUS } from '@/lib/constants'
import type { Student } from '@/types/database'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AlumniClientProps {
  data: Student[]
}

export function AlumniClient({ data }: AlumniClientProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const years = Array.from(new Set(data.map(s => s.admission_year))).sort((a, b) => b - a)

  const filteredData = selectedYear === 'all' 
    ? data 
    : data.filter(s => s.admission_year.toString() === selectedYear)

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus data alumni ini?')) return

    setDeleting(id)
    const result = await deleteStudent(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Data alumni berhasil dihapus')
    }
  }

  const columns = [
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
      key: 'admission_year', 
      header: 'Angkatan',
      className: 'w-[100px]',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Student) => (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {STUDENT_STATUS[row.status as keyof typeof STUDENT_STATUS]}
        </Badge>
      ),
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
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Alumni</h1>
          <p className="text-slate-600 mt-1">Kelola data siswa yang telah lulus (Alumni)</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Angkatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Angkatan</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  Angkatan {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        searchKey="full_name"
        searchPlaceholder="Cari nama alumni..."
        emptyMessage="Belum ada data alumni"
      />
    </div>
  )
}
