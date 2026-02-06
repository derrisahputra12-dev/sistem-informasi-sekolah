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
import { createClassGroup, deleteClassGroup } from '@/actions/curriculum'
import { Plus, Trash2, Loader2, Users, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { AcademicYear, GradeLevel, Staff } from '@/types/database'

interface ClassGroupWithRelations {
  id: string
  name: string
  capacity: number
  grade_levels?: { name: string } | null
  academic_years?: { name: string } | null
  staff?: { full_name: string } | null
}

interface RombelClientProps {
  data: ClassGroupWithRelations[]
  academicYears: AcademicYear[]
  gradeLevels: GradeLevel[]
  teachers: Staff[]
}

export function RombelClient({ data, academicYears, gradeLevels, teachers }: RombelClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createClassGroup(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Rombel berhasil ditambahkan')
      setOpen(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus rombel ini?')) return

    setDeleting(id)
    const result = await deleteClassGroup(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Rombel berhasil dihapus')
    }
  }

  const columns = [
    { key: 'name', header: 'Nama Rombel' },
    { 
      key: 'grade', 
      header: 'Tingkat',
      cell: (row: ClassGroupWithRelations) => row.grade_levels?.name || '-'
    },
    { 
      key: 'academic_year', 
      header: 'Tahun Ajaran',
      cell: (row: ClassGroupWithRelations) => row.academic_years?.name || '-'
    },
    { 
      key: 'homeroom', 
      header: 'Wali Kelas',
      cell: (row: ClassGroupWithRelations) => row.staff?.full_name || '-'
    },
    { 
      key: 'capacity', 
      header: 'Kapasitas',
      cell: (row: ClassGroupWithRelations) => (
        <Badge variant="secondary">{row.capacity} siswa</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[100px]',
      cell: (row: ClassGroupWithRelations) => (
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/kurikulum/rombel/${row.id}`}>
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

  const activeYear = academicYears.find(y => y.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rombongan Belajar</h1>
          <p className="text-slate-600 mt-1">Kelola kelas dan siswa</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Rombel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Rombongan Belajar</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="academic_year_id">Tahun Ajaran *</Label>
                <Select name="academic_year_id" defaultValue={activeYear?.id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.is_active && '(Aktif)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade_level_id">Tingkat Kelas *</Label>
                  <Select name="grade_level_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Rombel *</Label>
                  <Input id="name" name="name" placeholder="X IPA 1" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeroom_teacher_id">Wali Kelas</Label>
                  <Select name="homeroom_teacher_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih wali kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapasitas</Label>
                  <Input id="capacity" name="capacity" type="number" defaultValue={30} />
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
        searchKey="name"
        searchPlaceholder="Cari nama rombel..."
        emptyMessage="Belum ada rombel"
      />
    </div>
  )
}
