import { ProjectEditor } from '@/app/admin/(protected)/projects/ProjectEditor'
import { getProjectCategories } from '@/app/admin/(protected)/projects/options'

export default async function NewProjectPage() {
  return <ProjectEditor initial={null} categories={await getProjectCategories()} />
}
