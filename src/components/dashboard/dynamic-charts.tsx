'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

export const DynamicCharts = dynamic(
  () => import('./dashboard-charts').then(mod => mod.DashboardCharts),
  { 
    ssr: false,
    loading: () => (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-[400px] w-full" />
        ))}
      </div>
    )
  }
)
