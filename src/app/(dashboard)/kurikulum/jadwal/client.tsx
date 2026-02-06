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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { createSchedule, deleteSchedule } from '@/actions/curriculum'
import { Plus, Trash2, Loader2, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface TeachingAssignmentWithRelations {
  id: string
  hours_per_week: number
  staff?: { full_name: string } | null
  subjects?: { name: string } | null
  class_groups?: { name: string } | null
}

interface ScheduleWithRelations {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  room: string | null
  teaching_assignments?: TeachingAssignmentWithRelations | null
}

interface JadwalClientProps {
  data: ScheduleWithRelations[]
  teachingAssignments: TeachingAssignmentWithRelations[]
}

const DAYS = [
  { value: '1', label: 'Senin' },
  { value: '2', label: 'Selasa' },
  { value: '3', label: 'Rabu' },
  { value: '4', label: 'Kamis' },
  { value: '5', label: 'Jumat' },
  { value: '6', label: 'Sabtu' },
]

export function JadwalClient({ data, teachingAssignments }: JadwalClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createSchedule(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Jadwal berhasil ditambahkan')
      setOpen(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return

    setDeleting(id)
    const result = await deleteSchedule(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Jadwal berhasil dihapus')
    }
  }

  const getDayName = (day: number) => DAYS.find(d => d.value === String(day))?.label || '-'

  const columns = [
    { 
      key: 'day', 
      header: 'Hari',
      cell: (row: ScheduleWithRelations) => getDayName(row.day_of_week)
    },
    { 
      key: 'time', 
      header: 'Waktu',
      cell: (row: ScheduleWithRelations) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-slate-400" />
          {row.start_time.slice(0, 5)} - {row.end_time.slice(0, 5)}
        </div>
      )
    },
    { 
      key: 'subject', 
      header: 'Mata Pelajaran',
      cell: (row: ScheduleWithRelations) => row.teaching_assignments?.subjects?.name || '-'
    },
    { 
      key: 'class', 
      header: 'Kelas',
      cell: (row: ScheduleWithRelations) => row.teaching_assignments?.class_groups?.name || '-'
    },
    { 
      key: 'teacher', 
      header: 'Guru',
      cell: (row: ScheduleWithRelations) => row.teaching_assignments?.staff?.full_name || '-'
    },
    { key: 'room', header: 'Ruangan', cell: (row: ScheduleWithRelations) => row.room || '-' },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[80px]',
      cell: (row: ScheduleWithRelations) => (
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
          <h1 className="text-2xl font-bold text-slate-900">Jadwal Pelajaran</h1>
          <p className="text-slate-600 mt-1">Kelola jadwal mengajar</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jadwal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Pelajaran</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teaching_assignment_id">Penugasan Mengajar *</Label>
                <Select name="teaching_assignment_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penugasan" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachingAssignments.map((ta) => (
                      <SelectItem key={ta.id} value={ta.id}>
                        {ta.subjects?.name} - {ta.class_groups?.name} ({ta.staff?.full_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Hari *</Label>
                  <Select name="day_of_week" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Mulai *</Label>
                  <Input id="start_time" name="start_time" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Selesai *</Label>
                  <Input id="end_time" name="end_time" type="time" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Ruangan</Label>
                <Input id="room" name="room" placeholder="Ruang 101" />
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
        searchKey="room"
        searchPlaceholder="Cari ruangan..."
        emptyMessage="Belum ada jadwal"
      />
    </div>
  )
}
