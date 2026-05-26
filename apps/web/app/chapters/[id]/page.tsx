import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getChapter, nextChapterId } from '@content/chapters'
import { ChapterRunner } from './ChapterRunner'

export const dynamic = 'force-dynamic'

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const chapter = getChapter(id)
  if (!chapter) notFound()

  const next = nextChapterId(chapter.id)
  return (
    <main className="page">
      <p className="eyebrow" style={{ marginBottom: 4 }}>
        <Link href="/">← Campaign</Link> · {chapter.act}
      </p>
      <h1 style={{ marginTop: 0 }}>
        Ch.{chapter.order.toString().padStart(2, '0')} — {chapter.title}
      </h1>

      <ChapterRunner chapter={chapter} nextChapterId={next ?? null} />
    </main>
  )
}
