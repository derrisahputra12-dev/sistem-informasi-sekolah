import { getCurrentUser } from '@/actions/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'
import ForcePasswordChange from '@/components/auth/force-password-change'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export async function generateMetadata(): Promise<Metadata> {
  const user = await getCurrentUser()
  const schoolName = user?.schools?.name || 'SIS'
  const favicon = user?.schools?.favicon_url || '/favicon.ico'

  return {
    title: {
      template: `%s | ${schoolName}`,
      default: schoolName,
    },
    icons: {
      icon: favicon,
    },
  }
}

async function SidebarWrapper() {
  const user = await getCurrentUser()
  return <Sidebar user={user} />
}

async function HeaderWrapper() {
  const user = await getCurrentUser()
  return <Header user={user} />
}

async function AuthGuard() {
  const user = await getCurrentUser()
  return <ForcePasswordChange mustChange={!!user?.must_change_password} />
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={null}>
        <AuthGuard />
      </Suspense>
      
      {/* Sidebar - Non-blocking */}
      <Suspense fallback={<div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 animate-pulse" />}>
        <SidebarWrapper />
      </Suspense>

      {/* Main Content */}
      <div className="lg:ml-64">
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
          <HeaderWrapper />
        </Suspense>
        <main className="p-6">
          {children}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
