import { notFound, redirect } from 'next/navigation'
import { getStaffMember } from '@/actions/staff'
import { getPositions } from '@/actions/master-data'
import { getCurrentUser } from '@/actions/auth'
import { EditStaffClient } from './client'

interface EditStaffPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params
  const [staff, positions, user] = await Promise.all([
    getStaffMember(id),
    getPositions(),
    getCurrentUser()
  ])

  if (!staff) {
    notFound()
  }

  if (!user || user.role !== 'super_admin') {
    redirect('/pegawai')
  }

  return <EditStaffClient staff={staff} positions={positions} />
}
