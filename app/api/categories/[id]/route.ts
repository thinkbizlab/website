import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories, articles } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = body.slug?.trim() || name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const [updated] = await db.update(categories)
      .set({
        name,
        slug,
        description: body.description?.trim() || null,
        color: body.color?.trim() || '#7C3AED',
        order: Number(body.order ?? 0),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, params.id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e: unknown) {
    const msg = String(e)
    if (msg.includes('unique')) return NextResponse.json({ error: 'ชื่อหรือ slug นี้มีอยู่แล้ว' }, { status: 409 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Check if any articles use this category
    const [cat] = await db.select().from(categories).where(eq(categories.id, params.id))
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const usedBy = await db.select({ id: articles.id }).from(articles)
      .where(eq(articles.category, cat.name))

    if (usedBy.length > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบได้ — มีบทความ ${usedBy.length} บทความที่ใช้หมวดหมู่นี้` },
        { status: 409 },
      )
    }

    await db.delete(categories).where(eq(categories.id, params.id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
