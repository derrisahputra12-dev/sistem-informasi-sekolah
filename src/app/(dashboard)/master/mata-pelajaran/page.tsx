import { getSubjects } from '@/actions/master-data'
import { SubjectsClient } from './client'

export default async function SubjectsPage() {
  const data = await getSubjects()
  return <SubjectsClient data={data} />
}
