import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, CheckCircle2, ArrowRight, Users, BookOpen, Calculator, Shield } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Manajemen Siswa',
      description: 'Kelola data siswa, PPDB, mutasi, dan dokumen dengan mudah',
    },
    {
      icon: BookOpen,
      title: 'Kurikulum & Akademik',
      description: 'Jadwal pelajaran, E-Raport, dan kalender akademik terintegrasi',
    },
    {
      icon: Calculator,
      title: 'Keuangan Sekolah',
      description: 'SPP, tabungan siswa, dan kas sekolah dalam satu sistem',
    },
    {
      icon: Shield,
      title: 'Keamanan Data',
      description: 'Data terisolasi per sekolah dengan Row Level Security',
    },
  ]

  const plans = [
    {
      name: 'Free',
      price: 'Gratis',
      features: ['100 siswa', '20 pegawai', 'PPDB', 'Presensi dasar'],
    },
    {
      name: 'Pro',
      price: 'Rp 500.000/bulan',
      features: ['500 siswa', '100 pegawai', 'E-Raport', 'Keuangan', 'Perpustakaan'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Hubungi Kami',
      features: ['Unlimited siswa', 'Unlimited pegawai', 'Semua fitur', 'Fingerprint', 'Custom domain'],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">SIS</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
            Digitalisasi Ekosistem Sekolah{' '}
            <span className="text-primary">Indonesia</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Sistem Informasi Sekolah modern yang cepat, andal, dan adaptif.
            Kelola siswa, pegawai, akademik, dan keuangan dalam satu platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Mulai Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Lihat Fitur</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900">
            Fitur Lengkap untuk Sekolah Anda
          </h2>
          <p className="mt-4 text-center text-slate-600 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola sekolah secara digital
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900">
            Pilih Paket yang Sesuai
          </h2>
          <p className="mt-4 text-center text-slate-600 max-w-2xl mx-auto">
            Mulai gratis, upgrade sesuai kebutuhan sekolah Anda
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl bg-white border-2 ${
                  plan.popular ? 'border-primary shadow-xl' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-primary text-white rounded-full mb-4">
                    Populer
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-2xl font-bold text-primary">{plan.price}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-8"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">Pilih Paket</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">SIS - Sistem Informasi Sekolah</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} SIS. Digitalisasi Pendidikan Indonesia.
          </p>
        </div>
      </footer>
    </div>
  )
}
