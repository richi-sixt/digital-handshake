import { HomeContent } from '@/components/HomeContent'
import { getHomeEntries } from '@/lib/entries'
import { getSkills } from '@/lib/skills'

export default async function Home() {
  let [{ work, education }, skills] = await Promise.all([
    getHomeEntries(),
    getSkills(),
  ])

  return <HomeContent work={work} education={education} skills={skills} />
}
