import { getClassGroups } from '@/actions/curriculum'
import { getAcademicYears } from '@/actions/master-data'
import { getReportCards } from '@/actions/raport'
import { GenerateRaportClient } from './client'

export default async function GenerateRaportPage() {
  const [classGroups, academicYears] = await Promise.all([
    getClassGroups(),
    getAcademicYears(),
  ])

  // Get report cards for active year if available
  const activeYear = academicYears.find(y => y.is_active)
  const reportCards = activeYear && classGroups[0] 
    ? await getReportCards(classGroups[0].id, activeYear.id, 1)
    : []

  return (
    <GenerateRaportClient
      classGroups={classGroups}
      academicYears={academicYears}
      reportCards={reportCards}
    />
  )
}
