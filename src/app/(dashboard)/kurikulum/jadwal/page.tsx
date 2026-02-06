import { getSchedules, getTeachingAssignments } from '@/actions/curriculum'
import { JadwalClient } from './client'

export default async function JadwalPage() {
  const [schedules, teachingAssignments] = await Promise.all([
    getSchedules(),
    getTeachingAssignments(),
  ])

  return (
    <JadwalClient 
      data={schedules} 
      teachingAssignments={teachingAssignments}
    />
  )
}
