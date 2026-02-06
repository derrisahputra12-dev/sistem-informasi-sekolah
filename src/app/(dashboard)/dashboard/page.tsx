import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { Users, GraduationCap, UserCog, Mail, TrendingUp, Calendar } from 'lucide-react'
import { getRecentActivities } from '@/actions/dashboard'
import { DynamicCharts } from '@/components/dashboard/dynamic-charts'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

async function StatsCards({ schoolId }: { schoolId: string }) {
  const supabase = await createClient()

  const [studentsResult, staffResult, lettersResult] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('staff').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('letters').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
  ])

  const stats = {
    students: studentsResult.count || 0,
    staff: staffResult.count || 0,
    letters: lettersResult.count || 0,
  }

  const cards = [
    {
      title: 'Total Siswa',
      value: stats.students.toLocaleString(),
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Pegawai',
      value: stats.staff.toLocaleString(),
      icon: UserCog,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Surat Masuk/Keluar',
      value: stats.letters.toLocaleString(),
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Tahun Ajaran',
      value: '2024/2025',
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function RecentActivitiesSection({ schoolId }: { schoolId: string }) {
  const activities = await getRecentActivities(schoolId).catch(() => [])

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Aktivitas Terkini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-4 text-center">Belum ada aktivitas terbaru</p>
          ) : (
            activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="text-sm text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user?.school_id) return null

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Selamat datang kembali, {user?.full_name}!
        </p>
      </div>

      {/* Stats Cards - Streamed */}
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      }>
        <StatsCards schoolId={user.school_id} />
      </Suspense>

      {/* Analytics Charts */}
      <DynamicCharts />

      {/* Activities & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Card className="h-[400px] border-0 shadow-sm"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>}>
          <RecentActivitiesSection schoolId={user.school_id} />
        </Suspense>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Tambah Siswa', href: '/siswa/tambah', icon: GraduationCap },
                { title: 'Tambah Pegawai', href: '/pegawai/tambah', icon: UserCog },
                { title: 'Buat Surat', href: '/surat/tambah', icon: Mail },
                { title: 'Pengaturan', href: '/settings', icon: TrendingUp },
              ].map((action) => (
                <a
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <action.icon className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{action.title}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
