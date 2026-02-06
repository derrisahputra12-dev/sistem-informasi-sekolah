import { getClassGroups } from '@/actions/curriculum'
import { getSubjects, getAcademicYears } from '@/actions/master-data'
import { InputNilaiClient } from './client'

export default async function InputNilaiPage() {
  const [classGroups, subjects, academicYears] = await Promise.all([
    getClassGroups(),
    getSubjects(),
    getAcademicYears(),
  ])

  return (
    <InputNilaiClient
      classGroups={classGroups}
      subjects={subjects}
      academicYears={academicYears}
    />
  )
}
