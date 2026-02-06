import { getStudents } from '@/actions/students'
import { AlumniClient } from './client'

export default async function AlumniPage() {
  const data = await getStudents('graduated')
  return <AlumniClient data={data} />
}
