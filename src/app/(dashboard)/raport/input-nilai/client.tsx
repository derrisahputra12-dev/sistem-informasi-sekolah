'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { bulkSaveGrades } from '@/actions/raport'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AcademicYear, Subject } from '@/types/database'

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

interface InputNilaiClientProps {
  classGroups: ClassGroupWithRelations[]
  subjects: Subject[]
  academicYears: AcademicYear[]
}

export function InputNilaiClient({ classGroups, subjects, academicYears }: InputNilaiClientProps) {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [grades, setGrades] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const selectedClassData = classGroups.find(c => c.id === selectedClass)
  const students = selectedClassData?.student_class_enrollments?.map(e => e.students) || []

  const activeYear = academicYears.find(y => y.is_active)

  function handleGradeChange(studentId: string, value: string) {
    const score = parseFloat(value)
    if (!isNaN(score) && score >= 0 && score <= 100) {
      setGrades(prev => ({ ...prev, [studentId]: score }))
    }
  }

  function getPredicate(score: number): string {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'E'
  }

  async function handleSave() {
    if (!selectedClass || !selectedSubject || !selectedYear) {
      toast.error('Lengkapi semua pilihan terlebih dahulu')
      return
    }

    const gradeRecords = Object.entries(grades)
      .filter(([_, score]) => score !== undefined)
      .map(([student_id, score]) => ({
        student_id,
        subject_id: selectedSubject,
        academic_year_id: selectedYear,
        semester: parseInt(selectedSemester),
        score,
      }))

    if (gradeRecords.length === 0) {
      toast.error('Tidak ada nilai yang diisi')
      return
    }

    setLoading(true)
    const result = await bulkSaveGrades(gradeRecords)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Nilai berhasil disimpan')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Input Nilai</h1>
        <p className="text-slate-600 mt-1">Input nilai siswa per mata pelajaran</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
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
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mapel" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && students.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Daftar Nilai</CardTitle>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Simpan Nilai
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="w-[120px]">Nilai</TableHead>
                  <TableHead className="w-[80px]">Predikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const score = grades[student.id]
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.nisn}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={score || ''}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          placeholder="0-100"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        {score !== undefined && (
                          <span className={`font-semibold ${
                            getPredicate(score) === 'A' ? 'text-green-600' :
                            getPredicate(score) === 'B' ? 'text-blue-600' :
                            getPredicate(score) === 'C' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {getPredicate(score)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : selectedClass && selectedSubject ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Tidak ada siswa di kelas ini
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Pilih tahun ajaran, semester, kelas, dan mata pelajaran untuk mulai input nilai
          </CardContent>
        </Card>
      )}
    </div>
  )
}
