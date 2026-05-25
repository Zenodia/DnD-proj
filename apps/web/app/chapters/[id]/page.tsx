import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FIVE_LAYER_LABEL,
  SEVEN_STEP_LABEL,
  getChapter,
  nextChapterId,
} from '@content/chapters'
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
      <p className="eyebrow">
        <Link href="/">← Campaign</Link>
        {' · '}
        {chapter.act}
      </p>
      <h1>
        Ch.{chapter.order.toString().padStart(2, '0')} — {chapter.title}
      </h1>
      <p className="lead">{chapter.purpose}</p>
      <p className="chapter-tags chapter-tags--header">
        <span className="tag">{SEVEN_STEP_LABEL[chapter.learningGoal.step]}</span>
        <span className="tag">{FIVE_LAYER_LABEL[chapter.learningGoal.layer]}</span>
      </p>
      <p className="briefing">{chapter.briefing}</p>

      <ChapterRunner chapter={chapter} nextChapterId={next ?? null} />
    </main>
  )
}
