import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { articleId, message, mode } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  if (!['test', 'all'].includes(mode)) return NextResponse.json({ error: 'mode must be test or all' }, { status: 400 })

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN not configured' }, { status: 500 })

  try {
    if (mode === 'test') {
      // Push to admin LINE user ID only
      const adminUserId = process.env.LINE_ADMIN_USER_ID
      if (!adminUserId) {
        return NextResponse.json({ error: 'LINE_ADMIN_USER_ID not configured — add it in Vercel env vars' }, { status: 500 })
      }

      const res = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: adminUserId, messages: [{ type: 'text', text: `[TEST]\n${message}` }] }),
      })
      if (!res.ok) {
        const err = await res.json()
        return NextResponse.json({ error: JSON.stringify(err) }, { status: 500 })
      }
      return NextResponse.json({ ok: true, mode: 'test' })
    }

    // mode === 'all' — broadcast to all followers
    const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: [{ type: 'text', text: message }] }),
    })
    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: JSON.stringify(err) }, { status: 500 })
    }

    // Mark article as broadcast sent
    if (articleId) {
      await db.update(articles)
        .set({ lineBroadcastSent: true, lineBroadcastAt: new Date() })
        .where(eq(articles.id, articleId))
    }

    return NextResponse.json({ ok: true, mode: 'all' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
