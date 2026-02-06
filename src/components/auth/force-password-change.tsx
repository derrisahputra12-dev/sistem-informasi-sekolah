'use client'

import { useState } from 'react'
import { updateInitialPassword } from '@/actions/auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react'

interface ForcePasswordChangeProps {
  mustChange: boolean
}

export default function ForcePasswordChange({ mustChange }: ForcePasswordChangeProps) {
  const [open, setOpen] = useState(mustChange)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  })

  if (!mustChange) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwords.new.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('Password konfirmasi tidak cocok')
      return
    }

    setLoading(true)
    const result = await updateInitialPassword(passwords.new)
    
    if (result.success) {
      toast.success('Password berhasil diperbarui')
      setOpen(false)
    } else {
      toast.error(result.error || 'Gagal memperbarui password')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <KeyRound className="h-5 w-5" />
            Amankan Akun Anda
          </DialogTitle>
          <DialogDescription>
            Anda masuk menggunakan password sementara. Silakan ganti password Anda dengan yang baru untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                required
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi password baru"
              required
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Password Baru
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
