'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { recordStaffAttendance } from '@/actions/attendance'
import { Check, X, Clock, AlertTriangle, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import type { Staff } from '@/types/database'

interface StaffAttendanceRecord {
  id: string
  staff_id: string
  status: string
  check_in_time: string | null
  check_out_time: string | null
  staff?: Staff
}

interface PresensiPegawaiClientProps {
  staffList: Staff[]
  initialAttendance: StaffAttendanceRecord[]
}

const STATUS_OPTIONS = [
  { value: 'present', label: 'Hadir', icon: Check, color: 'bg-green-100 text-green-700' },
  { value: 'sick', label: 'Sakit', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700' },
  { value: 'permitted', label: 'Izin', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  { value: 'leave', label: 'Cuti', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
  { value: 'absent', label: 'Alpa', icon: X, color: 'bg-red-100 text-red-700' },
]

export function PresensiPegawaiClient({ staffList, initialAttendance }: PresensiPegawaiClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [savingId, setSavingId] = useState<string | null>(null)

  async function handleRecord(staffId: string, status: string) {
    setSavingId(staffId)
    
    const formData = new FormData()
    formData.append('staff_id', staffId)
    formData.append('date', selectedDate)
    formData.append('status', status)
    formData.append('check_in_time', new Date().toTimeString().slice(0, 5))

    const result = await recordStaffAttendance(formData)
    setSavingId(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Presensi berhasil disimpan')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Presensi Pegawai</h1>
        <p className="text-slate-600 mt-1">Rekam kehadiran pegawai sekolah</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="space-y-2 min-w-[200px]">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Pegawai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staffList.map((staff, index) => {
              const existingRecord = initialAttendance.find(a => a.staff_id === staff.id)
              
              return (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 w-8">{index + 1}</span>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={staff.photo_url || undefined} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {staff.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{staff.full_name}</p>
                      <p className="text-sm text-slate-500">{staff.nip || 'Non-PNS'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {savingId === staff.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      STATUS_OPTIONS.map((status) => {
                        const isSelected = existingRecord?.status === status.value
                        const Icon = status.icon
                        return (
                          <Button
                            key={status.value}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className={isSelected ? status.color : ''}
                            onClick={() => handleRecord(staff.id, status.value)}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
