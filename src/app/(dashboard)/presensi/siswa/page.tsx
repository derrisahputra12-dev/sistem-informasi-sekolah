import { getClassGroups } from '@/actions/curriculum'
import { getStudentAttendance } from '@/actions/attendance'
import { PresensiSiswaClient } from './client'

export default async function PresensiSiswaPage() {
  const today = new Date().toISOString().split('T')[0]
  const [classGroups, attendance] = await Promise.all([
    getClassGroups(),
    getStudentAttendance(today),
  ])

  return (
    <PresensiSiswaClient 
      classGroups={classGroups}
      initialAttendance={attendance}
    />
  )
}
