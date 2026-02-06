import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudent } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Calendar, MapPin, Phone, User, Users } from 'lucide-react'
import { STUDENT_STATUS, GENDERS } from '@/lib/constants'

interface StudentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params
  const student = await getStudent(id)

  if (!student) {
    notFound()
  }

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    graduated: 'bg-blue-100 text-blue-700',
    transferred: 'bg-amber-100 text-amber-700',
    dropped: 'bg-red-100 text-red-700',
  }

  const initials = student.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/siswa">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detail Siswa</h1>
            <p className="text-slate-600 mt-1">Profil lengkap siswa</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/siswa/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={student.photo_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{student.full_name}</h2>
              <p className="text-slate-500">NISN: {student.nisn}</p>
              <Badge className={`mt-2 ${statusColor[student.status]}`}>
                {STUDENT_STATUS[student.status as keyof typeof STUDENT_STATUS]}
              </Badge>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">NIS</p>
                  <p className="font-medium">{student.nis}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tahun Masuk</p>
                  <p className="font-medium">{student.admission_year}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Cards */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Tempat, Tanggal Lahir</p>
                <p className="font-medium">
                  {student.birth_place},{' '}
                  {new Date(student.birth_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jenis Kelamin</p>
                <p className="font-medium">
                  {GENDERS[student.gender as keyof typeof GENDERS]}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Agama</p>
                <p className="font-medium">{student.religion}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Jenis Pendaftaran</p>
                <p className="font-medium capitalize">{student.enrollment_type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">NIK Siswa</p>
                <p className="font-medium">{student.nik_siswa || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nomor KIP</p>
                <p className="font-medium">{student.no_kip || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {student.health_history && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Kesehatan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">Riwayat Kesehatan</p>
                <p className="font-medium">{student.health_history}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kontak & Alamat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Alamat</p>
                  <p className="font-medium">{student.address || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">No. HP</p>
                  <p className="font-medium">{student.phone || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Data Orang Tua/Wali</CardTitle>
              <Badge variant="outline" className="capitalize">
                {student.parent_type === 'parent' ? 'Orang Tua' : 'Wali'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {student.parent_type === 'parent' ? (
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Ayah</p>
                      <p className="font-medium text-slate-900">{student.father_name || '-'}</p>
                      <p className="text-sm text-slate-500">NIK: {student.father_nik || '-'}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {student.father_phone || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Ibu</p>
                      <p className="font-medium text-slate-900">{student.mother_name || '-'}</p>
                      <p className="text-sm text-slate-500">NIK: {student.mother_nik || '-'}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {student.mother_phone || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Nama Wali</p>
                      <p className="font-medium text-slate-900">{student.guardian_name || '-'}</p>
                      <p className="text-sm text-slate-500">NIK: {student.guardian_nik || '-'}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {student.guardian_phone || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
