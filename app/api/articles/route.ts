import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { calculateGEOScore } from '@/lib/geo-score'
import { estimateReadTime, generateSlug } from '@/lib/markdown'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const all = await db.select().from(articles)
      .where(status ? eq(articles.status, status) : undefined)
      .orderBy(desc(articles.createdAt))
    return NextResponse.json(all)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const slug = body.slug || generateSlug(body.title)
    const readTime = estimateReadTime(body.content ?? '')
    const geoScore = calculateGEOScore(body)
    const now = new Date()

    const [article] = await db.insert(articles).values({
      ...body,
      slug,
      readTime,
      geoScore,
      publishScheduledAt: body.publishScheduledAt ? new Date(body.publishScheduledAt) : null,
      publishedAt: body.status === 'published' ? now : null,
      updatedAt: now,
    }).returning()

    return NextResponse.json(article, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
