import { getAcademicYears } from '@/actions/master-data'
import { AcademicYearsClient } from './client'

export default async function AcademicYearsPage() {
  const data = await getAcademicYears()
  return <AcademicYearsClient data={data} />
}
