import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Sistem Informasi Sekolah',
  description: 'Login ke Sistem Informasi Sekolah',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
