import SystemRegistrationsClient from './client'
import { getCurrentUser } from '@/actions/auth'
import { getPendingRegistrations } from '@/actions/system'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Manajemen Registrasi | SIS Admin',
  description: 'Kelola pendaftaran sekolah baru.',
}

export default async function SystemRegistrationsPage() {
  const user = await getCurrentUser()
  
  // Role-based protection: Only system_admin can access this page
  if (!user || user.role !== 'system_admin') {
    redirect('/dashboard')
  }

  // Fetch initial data on server
  const registrations = await getPendingRegistrations()

  return <SystemRegistrationsClient initialData={registrations} />
}
