import { getClassGroups } from '@/actions/curriculum'
import { getAcademicYears, getGradeLevels } from '@/actions/master-data'
import { getStaff } from '@/actions/staff'
import { RombelClient } from './client'

export default async function RombelPage() {
  const [classGroups, academicYears, gradeLevels, staff] = await Promise.all([
    getClassGroups(),
    getAcademicYears(),
    getGradeLevels(),
    getStaff(),
  ])

  return (
    <RombelClient 
      data={classGroups} 
      academicYears={academicYears}
      gradeLevels={gradeLevels}
      teachers={staff}
    />
  )
}
