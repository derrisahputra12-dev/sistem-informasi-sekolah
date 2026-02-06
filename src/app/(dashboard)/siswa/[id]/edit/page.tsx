import { notFound, redirect } from 'next/navigation'
import { getStudent } from '@/actions/students'
import { getCurrentUser } from '@/actions/auth'
import { EditStudentClient } from './client'

interface EditStudentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params
  const [student, user] = await Promise.all([
    getStudent(id),
    getCurrentUser()
  ])

  if (!student) {
    notFound()
  }

  if (!user || user.role !== 'super_admin') {
    redirect(`/siswa/${id}`)
  }

  return <EditStudentClient student={student} />
}
