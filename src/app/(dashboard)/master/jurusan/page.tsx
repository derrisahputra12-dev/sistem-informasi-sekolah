import { getCurrentUser } from '@/actions/auth'
import { getVocationalPrograms } from '@/actions/master-data'
import { JurusanClient } from './client'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Master Data Jurusan',
}

export default async function JurusanPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Only allow access if user is super_admin or admin
  if (user.role !== 'super_admin' && user.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Verify if school is SMK properly
  // Note: user.schools is typed as an object or array depending on the join
  // We need to check the actual data structure or cast it
  const school = user.schools as unknown as { education_level: string }
  
  if (school?.education_level !== 'smk') {
    redirect('/dashboard')
  }

  const vocationalPrograms = await getVocationalPrograms()

  return <JurusanClient data={vocationalPrograms} />
}
