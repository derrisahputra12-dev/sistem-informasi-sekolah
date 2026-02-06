import { getGradeLevels } from '@/actions/master-data'
import { getCurrentUser } from '@/actions/auth'
import { GradeLevelsClient } from './client'
import { redirect } from 'next/navigation'

export default async function GradeLevelsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const data = await getGradeLevels()
  const school = user.schools as unknown as { education_level: string }
  const educationLevel = school?.education_level || 'sma'

  return <GradeLevelsClient data={data} educationLevel={educationLevel} />
}
