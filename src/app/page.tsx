import { HomeContent } from '@/components/HomeContent'
import { getHomeEntries } from '@/lib/entries'

export default async function Home() {
  let { work, education } = await getHomeEntries()

  return <HomeContent work={work} education={education} />
}
