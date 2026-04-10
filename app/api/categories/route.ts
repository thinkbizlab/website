import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(categories).orderBy(asc(categories.order), asc(categories.name))
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const [created] = await db.insert(categories)
      .values({
        name,
        slug: body.slug?.trim() || slug,
        description: body.description?.trim() || null,
        color: body.color?.trim() || '#7C3AED',
        order: Number(body.order ?? 0),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(created, { status: 201 })
  } catch (e: unknown) {
    const msg = String(e)
    if (msg.includes('unique')) return NextResponse.json({ error: 'ชื่อหรือ slug นี้มีอยู่แล้ว' }, { status: 409 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
