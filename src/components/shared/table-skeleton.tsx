import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface TableSkeletonProps {
  title?: string
  description?: string
  rowCount?: number
  showAddButton?: boolean
}

export function TableSkeleton({ 
  title, 
  description, 
  rowCount = 5,
  showAddButton = true 
}: TableSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          {title ? (
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          ) : (
            <Skeleton className="h-8 w-[200px]" />
          )}
          {description ? (
            <p className="text-slate-600 mt-1">{description}</p>
          ) : (
            <Skeleton className="h-4 w-[300px]" />
          )}
        </div>
        {showAddButton && <Skeleton className="h-10 w-[150px]" />}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <Skeleton className="h-6 w-[150px]" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            <div className="p-4 border-b">
              <Skeleton className="h-10 w-full max-w-sm" />
            </div>
            {Array.from({ length: rowCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
