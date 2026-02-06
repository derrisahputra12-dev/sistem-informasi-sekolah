import { getStaff } from '@/actions/staff'
import { getStaffAttendance } from '@/actions/attendance'
import { PresensiPegawaiClient } from './client'

export default async function PresensiPegawaiPage() {
  const today = new Date().toISOString().split('T')[0]
  const [staffList, attendance] = await Promise.all([
    getStaff(),
    getStaffAttendance(today),
  ])

  return (
    <PresensiPegawaiClient 
      staffList={staffList}
      initialAttendance={attendance}
    />
  )
}
