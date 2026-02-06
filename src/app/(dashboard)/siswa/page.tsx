import { getStudents, getGraduatingCount } from '@/actions/students'
import { StudentsClient } from './client'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/shared/table-skeleton'

async function StudentsList() {
  const [data, graduatingCount] = await Promise.all([
    getStudents('active'),
    getGraduatingCount()
  ])
  return <StudentsClient data={data as any} graduatingCount={graduatingCount} />
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<TableSkeleton title="Daftar Siswa" description="Memuat data siswa..." />}>
      <StudentsList />
    </Suspense>
  )
}
