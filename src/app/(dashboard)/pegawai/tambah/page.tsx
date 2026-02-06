import { getPositions } from '@/actions/master-data'
import { AddStaffPageClient } from './client'

export default async function AddStaffPage() {
  const positions = await getPositions()
  return <AddStaffPageClient positions={positions} />
}
