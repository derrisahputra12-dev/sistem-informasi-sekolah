'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { createStudent } from '@/actions/students'
import { getCurrentUser } from '@/actions/auth'
import { RELIGIONS, GENDERS } from '@/lib/constants'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'
import { PhotoUpload } from '@/components/shared/photo-upload'

export default function AddStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [formData, setFormData] = useState({
    nisn: '',
    nis: '',
    full_name: '',
    father_name: '',
    mother_name: '',
    guardian_name: '',
    father_phone: '',
    mother_phone: '',
    guardian_phone: '',
    parent_type: 'parent' as 'parent' | 'guardian',
  })
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear())
  const [educationLevel, setEducationLevel] = useState<'sd' | 'smp' | 'sma' | 'smk' | null>(null)
  const [enrollmentType, setEnrollmentType] = useState('new')

  useEffect(() => {
    async function fetchSchool() {
      const user = await getCurrentUser()
      if (user?.schools?.education_level) {
        setEducationLevel(user.schools.education_level as any)
      }
    }
    fetchSchool()
  }, [])

  useEffect(() => {
    const now = new Date()
    const calendarYear = now.getFullYear()
    const taStartYear = now.getMonth() + 1 >= 7 ? calendarYear : calendarYear - 1
    const duration = educationLevel === 'sd' ? 6 : 3
    
    const isAlumni = admissionYear <= (taStartYear - duration)
    
    if (isAlumni) {
      setEnrollmentType('alumni')
    } else {
      setEnrollmentType('new')
    }
  }, [admissionYear, educationLevel])

  function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  function handleNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
    setIsDirty(true)
    const value = e.target.value.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
    // Ensure the input actually shows only numbers
    e.target.value = value
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setIsDirty(true)
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: toTitleCase(value) }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const result = await createStudent(new FormData(e.currentTarget))
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success('Siswa berhasil ditambahkan')
      router.push('/siswa')
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <UnsavedChangesWarning isDirty={isDirty} />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/siswa">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Siswa Baru</h1>
          <p className="text-slate-600 mt-1">Pendaftaran Peserta Didik Baru (PPDB)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Photo */}
          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Foto Siswa</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <PhotoUpload name="photo" onChange={() => setIsDirty(true)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Pendaftaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admission_year">Tahun Masuk *</Label>
                    <Select 
                      name="admission_year" 
                      defaultValue={currentYear.toString()} 
                      onValueChange={(val) => {
                        setIsDirty(true)
                        setAdmissionYear(parseInt(val))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enrollment_type">Jenis Pendaftaran</Label>
                    {(() => {
                      const now = new Date()
                      const calendarYear = now.getFullYear()
                      const taStartYear = now.getMonth() + 1 >= 7 ? calendarYear : calendarYear - 1
                      const duration = educationLevel === 'sd' ? 6 : 3
                      
                      const isAlumni = admissionYear <= (taStartYear - duration)
                      const isBerjalan = (admissionYear === taStartYear || admissionYear === calendarYear)

                      const options = []
                      if (!isAlumni) options.push({ value: 'new', label: 'Siswa Baru' })
                      if (isBerjalan) options.push({ value: 'transfer', label: 'Pindahan' })
                      if (isAlumni) options.push({ value: 'alumni', label: 'Alumni' })

                      return (
                        <Select 
                          name="enrollment_type" 
                          value={enrollmentType} 
                          disabled={options.length <= 1}
                          onValueChange={(val) => {
                            setIsDirty(true)
                            setEnrollmentType(val)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Other Data */}
          <div className="md:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Identitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nisn">NISN *</Label>
                    <Input 
                      id="nisn" 
                      name="nisn" 
                      placeholder="1234567890" 
                      required 
                      value={formData.nisn}
                      onChange={handleNumberInput}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nis">NIS *</Label>
                    <Input 
                      id="nis" 
                      name="nis" 
                      placeholder="12345" 
                      required 
                      value={formData.nis}
                      onChange={handleNumberInput}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">No. HP Siswa (Opsional)</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="0812345678" 
                    onChange={handleNumberInput}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nik_siswa">NIK Siswa (Opsional)</Label>
                    <Input 
                      id="nik_siswa" 
                      name="nik_siswa" 
                      placeholder="3171..." 
                      onChange={handleNumberInput}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_kip">Nomor KIP (Opsional)</Label>
                    <Input 
                      id="no_kip" 
                      name="no_kip" 
                      placeholder="Kartu Indonesia Pintar" 
                      onChange={handleNumberInput}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap *</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    placeholder="Ahmad Fauzi" 
                    required 
                    value={formData.full_name}
                    onChange={handleChange}
                    onBlur={handleNameBlur}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_place">Tempat Lahir *</Label>
                    <Input 
                      id="birth_place" 
                      name="birth_place" 
                      placeholder="Jakarta" 
                      required 
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                    <Input 
                      id="birth_date" 
                      name="birth_date" 
                      type="date" 
                      required 
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin *</Label>
                    <Select name="gender" required onValueChange={() => setIsDirty(true)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GENDERS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Agama *</Label>
                    <Select name="religion" required onValueChange={() => setIsDirty(true)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELIGIONS.map((religion) => (
                          <SelectItem key={religion} value={religion}>
                            {religion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="health_history">Riwayat Kesehatan (Opsional)</Label>
                  <Textarea 
                    id="health_history" 
                    name="health_history" 
                    placeholder="Contoh: Alergi kacang, Asma, dsb." 
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Data Kontak & Orang Tua/Wali</CardTitle>
                <div className="w-40">
                  <Select 
                    name="parent_type" 
                    defaultValue="parent" 
                    onValueChange={(val: 'parent' | 'guardian') => {
                      setIsDirty(true)
                      setFormData(prev => ({ ...prev, parent_type: val }))
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Orang Tua</SelectItem>
                      <SelectItem value="guardian">Wali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.parent_type === 'parent' ? (
                  <Tabs defaultValue="father" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="father">Informasi Ayah</TabsTrigger>
                      <TabsTrigger value="mother">Informasi Ibu</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="father" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="father_name">Nama Ayah</Label>
                          <Input 
                            id="father_name" 
                            name="father_name" 
                            placeholder="Nama Ayah" 
                            value={formData.father_name}
                            onChange={handleChange}
                            onBlur={handleNameBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="father_nik">NIK Ayah (Opsional)</Label>
                          <Input 
                            id="father_nik" 
                            name="father_nik" 
                            placeholder="3171..." 
                            onChange={handleNumberInput}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="father_phone">No. HP Ayah (Opsional)</Label>
                        <Input 
                          id="father_phone" 
                          name="father_phone" 
                          placeholder="0812345678" 
                          onChange={handleNumberInput}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="mother" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mother_name">Nama Ibu</Label>
                          <Input 
                            id="mother_name" 
                            name="mother_name" 
                            placeholder="Nama Ibu" 
                            value={formData.mother_name}
                            onChange={handleChange}
                            onBlur={handleNameBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mother_nik">NIK Ibu (Opsional)</Label>
                          <Input 
                            id="mother_nik" 
                            name="mother_nik" 
                            placeholder="3171..." 
                            onChange={handleNumberInput}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mother_phone">No. HP Ibu (Opsional)</Label>
                        <Input 
                          id="mother_phone" 
                          name="mother_phone" 
                          placeholder="0812345678" 
                          onChange={handleNumberInput}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guardian_name">Nama Wali</Label>
                        <Input 
                          id="guardian_name" 
                          name="guardian_name" 
                          placeholder="Nama Wali" 
                          value={formData.guardian_name}
                          onChange={handleChange}
                          onBlur={handleNameBlur}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guardian_nik">NIK Wali (Opsional)</Label>
                        <Input 
                          id="guardian_nik" 
                          name="guardian_nik" 
                          placeholder="3171..." 
                          onChange={handleNumberInput}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardian_phone">No. HP Wali (Opsional)</Label>
                      <Input 
                        id="guardian_phone" 
                        name="guardian_phone" 
                        placeholder="0812345678" 
                        onChange={handleNumberInput}
                      />
                    </div>
                  </div>
                )}

                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat (Opsional)</Label>
                  <Textarea 
                    id="address" 
                    name="address" 
                    placeholder="Jl. Merdeka No. 123" 
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/siswa" onClick={(e) => {
                  if (isDirty && !confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin batal?')) {
                    e.preventDefault()
                  }
                }}>Batal</Link>
              </Button>
              <Button type="submit" disabled={loading} className="px-8 font-semibold">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}



