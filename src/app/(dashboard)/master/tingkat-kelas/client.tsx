'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { createGradeLevel, deleteGradeLevel, updateGradeLevel } from '@/actions/master-data'
import { Plus, Trash2, Loader2, Edit } from 'lucide-react'
import type { GradeLevel } from '@/types/database'
import { toast } from 'sonner'
import { UnsavedChangesWarning } from '@/components/shared/unsaved-changes-warning'

interface GradeLevelsClientProps {
  data: GradeLevel[]
  educationLevel: string
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function GradeLevelsClient({ data, educationLevel }: GradeLevelsClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Determine grade options based on education level
  const getOptions = () => {
    switch(educationLevel) {
      case 'sd': return ['1', '2', '3', '4', '5', '6']
      case 'smp': return ['7', '8', '9']
      case 'sma':
      case 'smk': 
      default: return ['10', '11', '12']
    }
  }

  const options = getOptions()
  const [levelNumber, setLevelNumber] = useState(options[0])
  const [selectedLetter, setSelectedLetter] = useState('A')

  // Logic to find used letters for the current level number
  const usedLetters = data
    .filter(g => g.name.startsWith(`Kelas ${levelNumber}`) && g.id !== editingId)
    .map(g => LETTERS[g.order - 1])

  // Automatically select the first available letter when levelNumber changes or current is taken
  useEffect(() => {
    if (!levelNumber) return

    if (usedLetters.includes(selectedLetter) || !selectedLetter) {
      const firstAvailable = LETTERS.find(letter => !usedLetters.includes(letter))
      if (firstAvailable) {
        setSelectedLetter(firstAvailable)
      }
    }
  }, [levelNumber, usedLetters, selectedLetter])


  function handleOpenChange(newOpen: boolean, skipConfirm = false) {
    if (!newOpen && isDirty && !skipConfirm) {
      if (!confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin menutup?')) {
        return
      }
    }
    setOpen(newOpen)
    if (!newOpen) {
      setEditingId(null)
      setLevelNumber(options[0])
      setSelectedLetter('A')
      setIsDirty(false)
    }
  }

  function handleEdit(grade: GradeLevel) {
    setEditingId(grade.id)
    // Extract number from "Kelas 10 A" or "Kelas 10"
    const match = grade.name.match(/Kelas (\d+)/)
    if (match) setLevelNumber(match[1])
    
    // Set letter based on order
    const letter = LETTERS[grade.order - 1] || 'A'
    setSelectedLetter(letter)
    setOpen(true)
    setIsDirty(false) // Initially not dirty when just opened for edit
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData()
    // Always include letter in the name to satisfy unique constraint: "Kelas 10 A"
    formData.append('name', `Kelas ${levelNumber} ${selectedLetter}`)
    formData.append('order', (LETTERS.indexOf(selectedLetter) + 1).toString())

    const result = editingId 
      ? await updateGradeLevel(editingId, formData)
      : await createGradeLevel(formData)
      
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsDirty(false)
      toast.success(editingId ? 'Tingkat kelas berhasil diperbarui' : 'Tingkat kelas berhasil ditambahkan')
      handleOpenChange(false, true)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus tingkat kelas ini?')) return

    setDeleting(id)
    const result = await deleteGradeLevel(id)
    setDeleting(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Tingkat kelas berhasil dihapus')
    }
  }

  const columns = [

    { 
      key: 'order', 
      header: 'Huruf', 
      className: 'w-[100px]',
      cell: (row: GradeLevel) => LETTERS[row.order - 1] || row.order
    },
    { key: 'name', header: 'Nama Tingkat Kelas' },
    {
      key: 'actions',
      header: 'Aksi',
      cell: (row: GradeLevel) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            disabled={deleting === row.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleting === row.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
      className: 'w-[120px]'
    }
  ]

  return (
    <div className="space-y-6">
      <UnsavedChangesWarning isDirty={isDirty} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tingkat Kelas</h1>
          <p className="text-slate-600 mt-1">Kelola data tingkat kelas</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDirty(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tingkat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Tingkat Kelas' : 'Tambah Tingkat Kelas'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Tingkat</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Kelas</span>
                    <Select value={levelNumber} onValueChange={(val) => {
                      setLevelNumber(val)
                      setIsDirty(true)
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Huruf (Urutan)</Label>
                  <Select value={selectedLetter} onValueChange={(val) => {
                    setSelectedLetter(val)
                    setIsDirty(true)
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LETTERS.map(letter => {
                        const isUsed = usedLetters.includes(letter)
                        return (
                          <SelectItem 
                            key={letter} 
                            value={letter}
                            disabled={isUsed}
                          >
                            {letter} {isUsed && '(Sudah ada)'}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari tingkat kelas..."
        emptyMessage="Belum ada tingkat kelas"
      />
    </div>
  )
}




