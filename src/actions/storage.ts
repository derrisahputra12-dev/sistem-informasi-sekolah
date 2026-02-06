'use server'

import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

/**
 * Uploads a photo to Supabase Storage after compressing and converting to WebP.
 * @param file The file object to upload
 * @param folder folder name in the bucket (e.g. 'students' or 'staff')
 */
export async function uploadPhoto(file: File, folder: string) {
  if (!file) throw new Error('No file provided')

  console.log(`[Storage] Starting upload for ${file.name} to ${folder}...`)
  
  // Use admin client for storage to bypass RLS issues during initial setup
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createAdminClient()
  
  // 1. Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // 2. Process image with sharp: resize, compress, and convert to WebP
  console.log('[Storage] Processing image with sharp...')
  try {
    const processedImageBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(500, 500, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toBuffer()
      
    // 3. Upload to Supabase Storage
    // Generate a unique filename
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`
    console.log('[Storage] Uploading to bucket:', fileName)
    
    // Ensure bucket exists (or at least attempt to)
    // In many cases, we can't create it if it exists, so just try the upload
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, processedImageBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      })
      
    if (error) {
      console.error('[Storage] Upload error details:', error)
      throw new Error(error.message)
    }
    
    console.log('[Storage] Upload successful:', data.path)
    
    // 4. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)
      
    console.log('[Storage] Public URL generated:', publicUrlData.publicUrl)
    return publicUrlData.publicUrl
  } catch (sharpError) {
    console.error('[Storage] Sharp processing error:', sharpError)
    throw sharpError
  }
}
/**
 * Deletes a photo from Supabase Storage given its public URL.
 * @param url The full public URL of the photo
 */
export async function deletePhoto(url: string | null | undefined) {
  if (!url) return

  try {
    // Extract the path after '/public/photos/'
    // Typically: .../storage/v1/object/public/photos/folder/filename.webp
    const urlParts = url.split('/public/photos/')
    if (urlParts.length < 2) {
      console.warn('[Storage] Could not parse path from URL:', url)
      return
    }

    const filePath = urlParts[1]
    console.log('[Storage] Deleting file:', filePath)

    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createAdminClient()

    const { error } = await supabase.storage
      .from('photos')
      .remove([filePath])

    if (error) {
      console.error('[Storage] Error deleting file:', error)
    } else {
      console.log('[Storage] File deleted successfully')
    }
  } catch (err) {
    console.error('[Storage] Unexpected error during deletion:', err)
  }
}
