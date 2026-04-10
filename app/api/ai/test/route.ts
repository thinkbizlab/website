import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/schema'
import { eq } from 'drizzle-orm'

async function getAnthropicKey(): Promise<string> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, 'anthropic_api_key'))
    if (rows[0]?.value) return rows[0].value
  } catch { /* fallback */ }
  return process.env.ANTHROPIC_API_KEY ?? ''
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = await getAnthropicKey()
  if (!apiKey) return NextResponse.json({ error: 'ยังไม่ได้ตั้งค่า API Key' }, { status: 400 })

  try {
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Reply with OK only.' }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    return NextResponse.json({ ok: true, model: 'claude-haiku-4-5', reply: text })
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number }
    return NextResponse.json({ ok: false, error: err?.message ?? String(e) }, { status: 500 })
  }
}
