'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { generateReportCard, finalizeReportCard } from '@/actions/raport'
import { FileText, Loader2, CheckCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { AcademicYear } from '@/types/database'

interface ClassGroupWithRelations {
  id: string
  name: string
  student_class_enrollments?: Array<{
    id: string
    students: {
      id: string
      full_name: string
      nisn: string
    }
  }>
}

interface ReportCardWithRelations {
  id: string
  semester: number
  status: string
  total_sick_days: number
  total_permitted_days: number
  total_absent_days: number
  students?: {
    id: string
    full_name: string
    nisn: string
  }
}

interface GenerateRaportClientProps {
  classGroups: ClassGroupWithRelations[]
  academicYears: AcademicYear[]
  reportCards: ReportCardWithRelations[]
}

export function GenerateRaportClient({ classGroups, academicYears, reportCards }: GenerateRaportClientProps) {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [loading, setLoading] = useState<string | null>(null)

  const selectedClassData = classGroups.find(c => c.id === selectedClass)
  const students = selectedClassData?.student_class_enrollments?.map(e => e.students) || []

  async function handleGenerate(studentId: string) {
    if (!selectedClass || !selectedYear) {
      toast.error('Pilih kelas dan tahun ajaran')
      return
    }

    setLoading(studentId)
    
    const formData = new FormData()
    formData.append('student_id', studentId)
    formData.append('academic_year_id', selectedYear)
    formData.append('semester', selectedSemester)
    formData.append('class_group_id', selectedClass)

    const result = await generateReportCard(formData)
    setLoading(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Raport berhasil dibuat')
    }
  }

  async function handleFinalize(reportCardId: string) {
    setLoading(reportCardId)
    const result = await finalizeReportCard(reportCardId)
    setLoading(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Raport berhasil difinalisasi')
    }
  }

  const getExistingReportCard = (studentId: string) => {
    return reportCards.find(r => r.students?.id === studentId)
  }

  const columns = [
    { key: 'nisn', header: 'NISN' },
    { key: 'full_name', header: 'Nama Siswa' },
    {
      key: 'status',
      header: 'Status Raport',
      cell: (row: { id: string; full_name: string; nisn: string }) => {
        const rc = getExistingReportCard(row.id)
        if (!rc) {
          return <Badge variant="outline">Belum dibuat</Badge>
        }
        return (
          <Badge className={
            rc.status === 'finalized' ? 'bg-green-100 text-green-700' :
            rc.status === 'printed' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }>
            {rc.status === 'finalized' ? 'Final' : rc.status === 'printed' ? 'Dicetak' : 'Draft'}
          </Badge>
        )
      }
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[200px]',
      cell: (row: { id: string }) => {
        const rc = getExistingReportCard(row.id)
        
        return (
          <div className="flex gap-2">
            {!rc ? (
              <Button
                size="sm"
                onClick={() => handleGenerate(row.id)}
                disabled={loading === row.id}
              >
                {loading === row.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-1" />
                )}
                Generate
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/raport/cetak/${rc.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Link>
                </Button>
                {rc.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handleFinalize(rc.id)}
                    disabled={loading === rc.id}
                  >
                    {loading === rc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Finalisasi
                  </Button>
                )}
              </>
            )}
          </div>
        )
      }
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Generate Raport</h1>
        <p className="text-slate-600 mt-1">Buat dan kelola raport siswa</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Tahun Ajaran</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
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
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1 (Ganjil)</SelectItem>
                  <SelectItem value="2">Semester 2 (Genap)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classGroups.map((cg) => (
                    <SelectItem key={cg.id} value={cg.id}>
                      {cg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && students.length > 0 ? (
        <DataTable
          data={students}
          columns={columns}
          searchKey="full_name"
          searchPlaceholder="Cari nama siswa..."
          emptyMessage="Tidak ada siswa"
        />
      ) : selectedClass ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Tidak ada siswa di kelas ini
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Pilih tahun ajaran, semester, dan kelas untuk melihat daftar siswa
          </CardContent>
        </Card>
      )}
    </div>
  )
}
