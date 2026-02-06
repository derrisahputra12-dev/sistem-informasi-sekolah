'use server'

import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export interface Activity {
  text: string
  time: string
  timestamp: string
}

export async function getRecentActivities(schoolId: string): Promise<Activity[]> {
  const supabase = await createClient()

  // Fetch from multiple tables
  const [students, staff, letters] = await Promise.all([
    supabase
      .from('students')
      .select('full_name, created_at')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('staff')
      .select('full_name, created_at, updated_at')
      .eq('school_id', schoolId)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('letters')
      .select('subject, type, created_at')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const activities: Activity[] = []

  // Process students
  students.data?.forEach((item) => {
    activities.push({
      text: `Siswa baru didaftarkan: ${item.full_name}`,
      timestamp: item.created_at,
      time: formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: id }),
    })
  })

  // Process staff
  staff.data?.forEach((item) => {
    const isUpdate = item.updated_at !== item.created_at
    activities.push({
      text: `${isUpdate ? 'Data pegawai diperbarui' : 'Pegawai baru ditambahkan'}: ${item.full_name}`,
      timestamp: item.updated_at,
      time: formatDistanceToNow(new Date(item.updated_at), { addSuffix: true, locale: id }),
    })
  })

  // Process letters
  letters.data?.forEach((item) => {
    activities.push({
      text: `Surat ${item.type === 'incoming' ? 'masuk' : 'keluar'} dibuat: ${item.subject}`,
      timestamp: item.created_at,
      time: formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: id }),
    })
  })

  // Sort by timestamp desc and take top 5
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
}
