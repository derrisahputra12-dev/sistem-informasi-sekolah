'use client'

import Link from 'next/link'
import { useState, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  Settings,
  Calendar,
  BookOpen,
  Mail,
  Database,
  ChevronDown,
  FileText,
} from 'lucide-react'
import type { User, School } from '@/types/database'

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: { title: string; href: string }[]
  roles?: string[] // Optional: define roles that can see this item
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Siswa',
    icon: GraduationCap,
    roles: ['super_admin', 'admin', 'teacher'],
    children: [
      { title: 'Daftar Siswa', href: '/siswa' },
      { title: 'Alumni', href: '/siswa/alumni' },
      { title: 'Tambah Siswa', href: '/siswa/tambah' },
    ],
  },
  {
    title: 'Pegawai',
    icon: UserCog,
    roles: ['super_admin', 'admin', 'staff'],
    children: [
      { title: 'Daftar Pegawai', href: '/pegawai' },
      { title: 'Tambah Pegawai', href: '/pegawai/tambah' },
    ],
  },
  {
    title: 'Presensi',
    icon: Calendar,
    roles: ['super_admin', 'admin', 'teacher'],
    children: [
      { title: 'Presensi Siswa', href: '/presensi/siswa' },
      { title: 'Presensi Pegawai', href: '/presensi/pegawai' },
    ],
  },
  {
    title: 'E-Raport',
    icon: FileText,
    roles: ['super_admin', 'teacher'],
    children: [
      { title: 'Input Nilai', href: '/raport/input-nilai' },
      { title: 'Generate Raport', href: '/raport/generate' },
      { title: 'Ekstrakurikuler', href: '/raport/ekstrakurikuler' },
    ],
  },
  {
    title: 'Kurikulum',
    icon: BookOpen,
    roles: ['super_admin', 'admin', 'teacher'],
    children: [
      { title: 'Rombel', href: '/kurikulum/rombel' },
      { title: 'Jadwal Pelajaran', href: '/kurikulum/jadwal' },
    ],
  },
  {
    title: 'Surat',
    href: '/surat',
    icon: Mail,
    roles: ['super_admin', 'admin', 'staff'],
  },
  {
    title: 'Pengguna',
    href: '/users',
    icon: Users,
    roles: ['super_admin'],
  },
  {
    title: 'Master Data',
    icon: Database,
    roles: ['super_admin', 'admin'],
    children: [
      { title: 'Tahun Ajaran', href: '/master/tahun-ajaran' },
      { title: 'Tingkat Kelas', href: '/master/tingkat-kelas' },
      { title: 'Mata Pelajaran', href: '/master/mata-pelajaran' },
      { title: 'Jabatan', href: '/master/jabatan' },
    ],
  },
  {
    title: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    roles: ['super_admin', 'admin'],
  },
]

interface SidebarProps {
  user?: (User & { schools?: School | null }) | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const schoolName = user?.schools?.name || 'Sekolah'
  const educationLevel = user?.schools?.education_level
  const [openMenus, setOpenMenus] = useState<string[]>(['Master Data', 'Kurikulum', 'Presensi', 'E-Raport'])

  const toggleMenu = useCallback((title: string) => {
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }, [])

  // Filter items based on user role and school type
  const filteredNavItems = useMemo(() => {
    return navItems.map(item => {
      // Clone item to avoid mutating original
      const newItem = { ...item }

      // Add Jurusan to Master Data if school is SMK
      if (item.title === 'Master Data' && educationLevel === 'smk') {
        const hasJurusan = newItem.children?.some(c => c.title === 'Jurusan')
        if (!hasJurusan && newItem.children) {
          newItem.children = [
            ...newItem.children,
            { title: 'Jurusan', href: '/master/jurusan' }
          ]
        }
      }

      return newItem
    }).filter(item => {
      if (!item.roles) return true
      return user?.role && item.roles.includes(user.role)
    })
  }, [educationLevel, user?.role])

  // Add System Admin section for users with system_admin role
  const finalNavItems = useMemo(() => {
    const items = [...filteredNavItems]
    if (user?.role === 'system_admin') {
      items.push({
        title: 'System Admin',
        icon: LayoutDashboard,
        children: [
          { title: 'Daftar Registrasi', href: '/system/registrations' },
        ]
      })
    }
    return items
  }, [filteredNavItems, user?.role])

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary overflow-hidden">
          {user?.schools?.logo_url ? (
            <img 
              src={user.schools.logo_url} 
              alt="Logo" 
              className="h-full w-full object-cover"
            />
          ) : (
            <GraduationCap className="h-5 w-5 text-white" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">
            {schoolName}
          </span>
          <span className="text-xs text-slate-500 uppercase tracking-tighter">SIS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {finalNavItems.map((item) => {
          const isOpen = openMenus.includes(item.title)
          const isActive = item.href
            ? pathname === item.href
            : item.children?.some(child => pathname === child.href)

          if (item.children) {
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-8 mt-1 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.title}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

