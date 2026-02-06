import { getStaff } from '@/actions/staff'
import { getCurrentUser } from '@/actions/auth'
import { StaffClient } from './client'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/shared/table-skeleton'

async function StaffList() {
  const [data, user] = await Promise.all([
    getStaff(),
    getCurrentUser()
  ])
  return <StaffClient data={data as any} user={user} />
}

export default function StaffPage() {
  return (
    <Suspense fallback={<TableSkeleton title="Daftar Pegawai" description="Memuat data pegawai..." />}>
      <StaffList />
    </Suspense>
  )
}

