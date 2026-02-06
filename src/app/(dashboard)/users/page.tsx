import { getUsers } from '@/actions/users'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { UsersClient } from './client'

export default async function UsersPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== 'super_admin') {
    redirect('/dashboard')
  }

  const users = await getUsers()
  
  return <UsersClient data={users} />
}
