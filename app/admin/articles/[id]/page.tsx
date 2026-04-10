export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { ArticleForm } from '@/components/ArticleForm'

export const metadata = { title: 'แก้ไขบทความ' }

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  let article: typeof articles.$inferSelect | undefined
  try {
    const [found] = await db.select().from(articles).where(eq(articles.id, params.id))
    article = found
  } catch { /* DB not connected */ }

  if (!article) notFound()

  return <ArticleForm mode="edit" article={article} />
}
