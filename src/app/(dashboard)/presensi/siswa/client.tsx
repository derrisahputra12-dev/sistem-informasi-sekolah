'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { bulkRecordStudentAttendance } from '@/actions/attendance'
import { Check, X, Clock, AlertTriangle, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ClassGroupWithRelations {
  id: string
  name: string
  student_class_enrollments?: Array<{
    id: string
    students: {
      id: string
      full_name: string
      nisn: string
      photo_url: string | null
    }
  }>
}

interface AttendanceRecord {
  id: string
  student_id: string
  status: string
  students?: {
    id: string
    full_name: string
    nisn: string
    photo_url: string | null
  }
}

interface PresensiSiswaClientProps {
  classGroups: ClassGroupWithRelations[]
  initialAttendance: AttendanceRecord[]
}

const STATUS_OPTIONS = [
  { value: 'present', label: 'Hadir', icon: Check, color: 'bg-green-100 text-green-700' },
  { value: 'sick', label: 'Sakit', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700' },
  { value: 'permitted', label: 'Izin', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  { value: 'absent', label: 'Alpa', icon: X, color: 'bg-red-100 text-red-700' },
]

export function PresensiSiswaClient({ classGroups, initialAttendance }: PresensiSiswaClientProps) {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const selectedClassData = classGroups.find(c => c.id === selectedClass)
  const students = selectedClassData?.student_class_enrollments?.map(e => e.students) || []

  function handleStatusChange(studentId: string, status: string) {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  function setAllStatus(status: string) {
    const newAttendance: Record<string, string> = {}
    students.forEach(s => {
      newAttendance[s.id] = status
    })
    setAttendance(newAttendance)
  }

  async function handleSave() {
    if (!selectedClass || !selectedDate) {
      toast.error('Pilih kelas dan tanggal terlebih dahulu')
      return
    }

    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id,
      status,
    }))

    if (records.length === 0) {
      toast.error('Tidak ada presensi yang diisi')
      return
    }

    setLoading(true)
    const result = await bulkRecordStudentAttendance(selectedClass, selectedDate, records)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Presensi berhasil disimpan')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Presensi Siswa</h1>
        <p className="text-slate-600 mt-1">Rekam kehadiran siswa per kelas</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 min-w-[200px]">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 min-w-[250px]">
              <Label>Rombel / Kelas</Label>
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
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <Button
                  key={status.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setAllStatus(status.value)}
                  disabled={!selectedClass}
                >
                  Semua {status.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && students.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Daftar Siswa</CardTitle>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Simpan Presensi
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 w-8">{index + 1}</span>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.photo_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-slate-500">NISN: {student.nisn}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((status) => {
                      const isSelected = attendance[student.id] === status.value
                      const Icon = status.icon
                      return (
                        <Button
                          key={status.value}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className={isSelected ? status.color : ''}
                          onClick={() => handleStatusChange(student.id, status.value)}
                        >
                          <Icon className="h-4 w-4 mr-1" />
                          {status.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : selectedClass ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Tidak ada siswa di kelas ini
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Pilih kelas untuk mulai mengisi presensi
          </CardContent>
        </Card>
      )}
    </div>
  )
}
