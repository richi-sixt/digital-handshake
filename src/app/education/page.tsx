import { type Metadata } from 'next'

import { EducationPageContent } from '@/components/EducationPageContent'
import { getAllEducation } from '@/lib/education'

export const metadata: Metadata = {
  title: 'Education',
  description:
    'My educational background and professional certifications.',
}

export default async function EducationIndex() {
  let educations = await getAllEducation()

  return <EducationPageContent educations={educations} />
}
