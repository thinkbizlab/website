import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { calculateGEOScore } from '@/lib/geo-score'
import { estimateReadTime } from '@/lib/markdown'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [article] = await db.select().from(articles).where(eq(articles.id, params.id))
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(article)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const geoScore = calculateGEOScore(body)
    const readTime = estimateReadTime(body.content ?? '')
    const now = new Date()

    const [updated] = await db.update(articles)
      .set({
        ...body,
        geoScore,
        readTime,
        publishScheduledAt: body.publishScheduledAt ? new Date(body.publishScheduledAt) : null,
        publishedAt: body.status === 'published' ? now : null,
        updatedAt: now,
      })
      .where(eq(articles.id, params.id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(articles).where(eq(articles.id, params.id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
