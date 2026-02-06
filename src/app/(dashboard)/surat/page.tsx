import { getLetters } from '@/actions/staff'
import { LettersClient } from './client'

export default async function LettersPage() {
  const data = await getLetters()
  return <LettersClient data={data} />
}
