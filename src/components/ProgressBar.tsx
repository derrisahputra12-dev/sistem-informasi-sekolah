'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import nProgress from 'nprogress'
import './nprogress.css'

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    nProgress.configure({ 
      showSpinner: false,
      speed: 500,
      minimum: 0.3
    })
  }, [])

  useEffect(() => {
    // When the route changes, complete the progress bar
    nProgress.done()

    return () => {
      // When the component starts to unmount or changes (start of transition)
      nProgress.start()
    }
  }, [pathname, searchParams])

  return null
}
