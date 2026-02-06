'use client'

import { useEffect } from 'react'

interface UnsavedChangesWarningProps {
  isDirty: boolean
  message?: string
}

export function UnsavedChangesWarning({ isDirty, message = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?' }: UnsavedChangesWarningProps) {
  useEffect(() => {
    // browser refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    // internal navigation (next.js)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (isDirty && anchor && anchor.href && !anchor.href.includes('#')) {
        const targetUrl = new URL(anchor.href)
        const currentUrl = new URL(window.location.href)

        // Only warn if navigating to a different page
        if (targetUrl.pathname !== currentUrl.pathname) {
          if (!window.confirm(message)) {
            e.preventDefault()
            e.stopImmediatePropagation()
          }
        }
      }
    }

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      // Use capture phase to intercept clicks before Next.js Link handles them
      window.addEventListener('click', handleAnchorClick, true)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('click', handleAnchorClick, true)
    }
  }, [isDirty, message])

  return null
}

