import { getExtracurriculars } from '@/actions/raport'
import { getStaff } from '@/actions/staff'
import { EskulClient } from './client'

export default async function EskulPage() {
  const [extracurriculars, staff] = await Promise.all([
    getExtracurriculars(),
    getStaff(),
  ])

  return <EskulClient data={extracurriculars} staff={staff} />
}
