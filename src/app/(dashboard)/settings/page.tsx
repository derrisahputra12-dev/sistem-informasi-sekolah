import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { SettingsClient } from './client'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    redirect('/dashboard')
  }

  return <SettingsClient initialUser={user} />
}
