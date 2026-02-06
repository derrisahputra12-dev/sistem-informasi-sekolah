'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { createUser, deleteUser, updateUserRole } from '@/actions/users'
import { Trash2, Loader2, Plus, UserPlus, Shield, User as UserIcon, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react'
import type { User, UserRole } from '@/types/database'
import { toast } from 'sonner'
import { useEffect } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UsersClientProps {
  data: User[]
}

export function UsersClient({ data }: UsersClientProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New user form state
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'staff' as UserRole
  })
  const [showPassword, setShowPassword] = useState(false)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let retVal = ""
    for (let i = 0, n = charset.length; i < 10; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n))
    }
    setFormState(prev => ({ ...prev, password: retVal }))
  }

  useEffect(() => {
    if (isAddDialogOpen) {
      generatePassword()
    } else {
      setFormState({ email: '', password: '', fullName: '', role: 'staff' })
      setCopiedType(null)
      setShowPassword(false)
    }
  }, [isAddDialogOpen])

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    toast.success(`${type} berhasil disalin`)
    setTimeout(() => setCopiedType(null), 2000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus pengguna ini? Akses masuk akan dicabut.')) return

    setLoading(id)
    const result = await deleteUser(id)
    setLoading(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Pengguna berhasil dihapus')
    }
  }

  async function handleRoleChange(id: string, newRole: UserRole) {
    setLoading(id)
    const result = await updateUserRole(id, newRole)
    setLoading(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Peran berhasil diperbarui')
    }
  }

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append('full_name', formState.fullName)
    formData.append('email', formState.email)
    formData.append('password', formState.password)
    formData.append('role', formState.role)

    const result = await createUser(formData)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Pengguna berhasil ditambahkan')
      setIsAddDialogOpen(false)
    }
  }

  const roleLabels: Record<UserRole, string> = {
    system_admin: 'System Admin',
    super_admin: 'Super Admin',
    admin: 'Admin',
    teacher: 'Guru',
    staff: 'Staff',
    student: 'Siswa',
    parent: 'Wali Murid',
  }

  const roleColors: Record<UserRole, string> = {
    system_admin: 'bg-black text-white border-slate-900',
    super_admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    admin: 'bg-blue-100 text-blue-700 border-blue-200',
    teacher: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    staff: 'bg-amber-100 text-amber-700 border-amber-200',
    student: 'bg-slate-100 text-slate-700 border-slate-200',
    parent: 'bg-purple-100 text-purple-700 border-purple-200',
  }

  const columns = [
    {
      key: 'full_name',
      header: 'Nama Pengguna',
      cell: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{row.full_name}</span>
            <span className="text-xs text-slate-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Peran',
      cell: (row: User) => (
        <Select
          defaultValue={row.role}
          onValueChange={(value) => handleRoleChange(row.id, value as UserRole)}
          disabled={loading === row.id || row.role === 'super_admin'}
        >
          <SelectTrigger className={`h-8 w-[140px] text-xs font-medium border ${roleColors[row.role]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="teacher">Guru</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: User) => (
        <Badge variant="outline" className={row.is_active ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-400'}>
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'w-[80px]',
      cell: (row: User) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(row.id)}
            disabled={loading === row.id || row.role === 'super_admin'}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Hapus pengguna"
          >
            {loading === row.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
          <p className="text-slate-600 mt-1">Kelola akun dan level akses sekolah</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Buat akun baru untuk staff atau guru sekolah Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    placeholder="Contoh: Budi Santoso" 
                    required 
                    value={formState.fullName}
                    onChange={(e) => setFormState(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="budi@email.com" 
                      required 
                      value={formState.email}
                      onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formState.email, 'Email')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {copiedType === 'Email' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password Sementara</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        readOnly
                        value={formState.password}
                        className="bg-slate-50 pr-20"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(formState.password, 'Password')}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          {copiedType === 'Password' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={generatePassword}
                      title="Generate Ulang"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Password dibuat otomatis untuk keamanan. Silakan salin untuk diberikan ke pengguna.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Peran / Role</Label>
                  <Select 
                    name="role" 
                    value={formState.role}
                    onValueChange={(val) => setFormState(prev => ({ ...prev, role: val as UserRole }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Guru</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CardStats 
          title="Total Pengguna" 
          value={data.length} 
          icon={<UserIcon className="h-4 w-4" />}
          description="Akun terdaftar"
        />
        <CardStats 
          title="Guru" 
          value={data.filter(u => u.role === 'teacher').length} 
          icon={<Shield className="h-4 w-4" />}
          description="Akses akademik"
        />
        <CardStats 
          title="Admin/Staff" 
          value={data.filter(u => u.role === 'admin' || u.role === 'staff').length} 
          icon={<Plus className="h-4 w-4" />}
          description="Akses operasional"
        />
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchKey="full_name"
        searchPlaceholder="Cari pengguna..."
        emptyMessage="Belum ada pengguna lain"
      />
    </div>
  )
}

function CardStats({ title, value, icon, description }: { title: string, value: number, icon: React.ReactNode, description: string }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  )
}
