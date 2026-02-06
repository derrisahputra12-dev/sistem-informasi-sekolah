import { getPositions } from '@/actions/master-data'
import { PositionsClient } from './client'

export default async function PositionsPage() {
  const data = await getPositions()
  return <PositionsClient data={data} />
}
