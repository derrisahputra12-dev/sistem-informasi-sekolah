'use client'

import { useState, useEffect } from 'react'
import { getPendingRegistrations, approveRegistration, rejectRegistration } from '@/actions/system'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  Mail, 
  Phone,
  MessageSquare,
  Search,
  RefreshCcw,
  ExternalLink
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast, Toaster } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Copy, Check } from 'lucide-react'

interface SystemRegistrationsClientProps {
  initialData: any[]
}

export default function SystemRegistrationsClient({ initialData }: SystemRegistrationsClientProps) {
  const [registrations, setRegistrations] = useState<any[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [approvedData, setApprovedData] = useState<any | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchRegistrations = async () => {
    setLoading(true)
    const data = await getPendingRegistrations()
    setRegistrations(data)
    setLoading(false)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
    toast.success(`${type} disalin ke clipboard`)
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui pendaftaran ini?')) return
    
    setProcessingId(id)
    const result = await approveRegistration(id)
    
    if (result.success && result.data) {
      toast.success('Pendaftaran disetujui!')
      setApprovedData(result.data)
      // We don't refresh yet, let them see the credentials in the modal
    } else {
      toast.error(result.error || 'Gagal menyetujui pendaftaran')
    }
    setProcessingId(null)
  }

  const closeSuccessModal = () => {
    setApprovedData(null)
    fetchRegistrations()
  }

  const handleReject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak pendaftaran ini?')) return
    
    setProcessingId(id)
    const result = await rejectRegistration(id)
    if (result.success) {
      toast.success('Pendaftaran ditolak')
      fetchRegistrations()
    } else {
      toast.error(result.error || 'Gagal menolak pendaftaran')
    }
    setProcessingId(null)
  }

  const filtered = registrations.filter(r => 
    r.school_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pendaftaran</h1>
          <p className="text-muted-foreground">Kelola permintaan pendaftaran sekolah baru ke dalam sistem.</p>
        </div>
        <Button onClick={fetchRegistrations} variant="outline" size="sm" className="w-fit">
          <RefreshCcw className={loading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
          Muat Ulang
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari sekolah, nama, atau email..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              {search ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada permintaan pendaftaran.'}
            </CardContent>
          </Card>
        ) : (
          filtered.map((reg) => (
            <Card key={reg.id} className={reg.status === 'pending' ? 'border-l-4 border-l-amber-500' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Building2 className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{reg.school_name}</CardTitle>
                    <CardDescription className="uppercase font-bold text-[10px] tracking-widest">{reg.education_level}</CardDescription>
                  </div>
                </div>
                <Badge variant={
                  reg.status === 'approved' ? 'success' : 
                  reg.status === 'rejected' ? 'destructive' : 
                  'warning'
                }>
                  {reg.status === 'pending' ? 'Menunggu' : 
                   reg.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mt-2 grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    {reg.full_name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    {reg.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    {reg.phone}
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    Mendaftar pada: {new Date(reg.created_at).toLocaleString('id-ID')}
                  </div>
                  
                  {reg.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleReject(reg.id)}
                        disabled={processingId === reg.id}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={() => handleApprove(reg.id)}
                        disabled={processingId === reg.id}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Setujui
                      </Button>
                    </div>
                  )}

                  {reg.status === 'approved' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        let cleanPhone = reg.phone.replace(/[^0-9]/g, '')
                        if (cleanPhone.startsWith('0')) {
                          cleanPhone = '62' + cleanPhone.slice(1)
                        } else if (cleanPhone.startsWith('8')) {
                          cleanPhone = '62' + cleanPhone
                        }
                        window.open(`https://wa.me/${cleanPhone}`, '_blank')
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                      Hubungi via WA
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!approvedData} onOpenChange={(open) => !open && closeSuccessModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Pendaftaran Disetujui
            </DialogTitle>
            <DialogDescription>
              Sekolah <strong>{approvedData?.schoolName}</strong> telah berhasil didaftarkan.
              Silakan salin atau kirim detail login berikut ke PIC sekolah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Email Admin</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={approvedData?.email || ''} className="bg-slate-50" />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => copyToClipboard(approvedData?.email, 'Email')}
                >
                  {copied === 'Email' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Password Sementara</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={approvedData?.password || ''} className="bg-slate-50" />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => copyToClipboard(approvedData?.password, 'Password')}
                >
                  {copied === 'Password' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-100 italic">
              "Pastikan PIC segera mengganti password setelah login pertama kali."
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={closeSuccessModal}
            >
              Tutup
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                const { email, password, phone, fullName, schoolName } = approvedData
                let cleanPhone = phone.replace(/[^0-9]/g, '')
                if (cleanPhone.startsWith('0')) {
                  cleanPhone = '62' + cleanPhone.slice(1)
                } else if (cleanPhone.startsWith('8')) {
                  cleanPhone = '62' + cleanPhone
                }
                const loginUrl = window.location.origin + '/login'
                const msg = encodeURIComponent(
                  `*SELAMAT! PENDAFTARAN SEKOLAH DISETUJUI*\n\n` +
                  `Halo *${fullName}*,\n` +
                  `Pendaftaran sekolah *${schoolName}* telah disetujui.\n\n` +
                  `Berikut adalah detail akun Admin Anda:\n` +
                  `- *Email:* ${email}\n` +
                  `- *Password:* ${password}\n\n` +
                  `Silakan login di sini:\n` +
                  `${loginUrl}\n\n` +
                  `_Penting: Segera ganti password Anda setelah login demi keamanan._`
                )
                window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4 text-white" />
              Kirim via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
