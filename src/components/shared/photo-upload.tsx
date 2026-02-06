'use client'

import { useState, useRef } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhotoUploadProps {
  name: string
  defaultValue?: string
  onChange?: (isDirty: boolean) => void
}

export function PhotoUpload({ name, defaultValue, onChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null)
  const [isRemoved, setIsRemoved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar (maks. 5MB)')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setIsRemoved(false)
      onChange?.(true)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setIsRemoved(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onChange?.(true)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center relative shadow-sm">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="h-10 w-10 text-slate-400" />
          )}
          
          <div 
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {preview && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-md hover:scale-110 transition-transform"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <input
        type="file"
        id={name}
        name={name}
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <input 
        type="hidden" 
        name={`${name}-removed`} 
        value={isRemoved ? 'true' : 'false'} 
      />
      
      <div className="text-center">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8"
        >
          {preview ? 'Ganti Foto' : 'Pilih Foto'}
        </Button>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider font-medium">
          JPG, PNG, WebP • MAKS 5MB
        </p>
      </div>
    </div>
  )
}
