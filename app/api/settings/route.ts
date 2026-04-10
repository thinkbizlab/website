import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/schema'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(settings)
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))

  const enabled = map['cron_enabled'] !== 'false'

  const mask = (k: string) => {
    const v = map[k] ?? ''
    return {
      set: !!v,
      masked: v.length > 8 ? v.slice(0, 6) + '••••••••••••' + v.slice(-4) : v ? '••••••••' : '',
    }
  }

  const anthropic = mask('anthropic_api_key')
  const fal = mask('fal_api_key')

  return NextResponse.json({
    cron_enabled: enabled,
    anthropic_key_set: anthropic.set,
    anthropic_key_masked: anthropic.masked,
    fal_key_set: fal.set,
    fal_key_masked: fal.masked,
    timezone: map['timezone'] ?? 'Asia/Bangkok',
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if ('cron_enabled' in body) {
    await db.insert(settings)
      .values({ key: 'cron_enabled', value: String(body.cron_enabled), updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(body.cron_enabled), updatedAt: new Date() } })
    return NextResponse.json({ cron_enabled: body.cron_enabled })
  }

  if ('timezone' in body) {
    const tz = String(body.timezone).trim()
    if (!tz) return NextResponse.json({ error: 'Timezone cannot be empty' }, { status: 400 })
    await db.insert(settings)
      .values({ key: 'timezone', value: tz, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: tz, updatedAt: new Date() } })
    return NextResponse.json({ ok: true })
  }

  if ('anthropic_api_key' in body) {
    const key = String(body.anthropic_api_key).trim()
    if (!key) return NextResponse.json({ error: 'Key cannot be empty' }, { status: 400 })
    await db.insert(settings)
      .values({ key: 'anthropic_api_key', value: key, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: key, updatedAt: new Date() } })
    return NextResponse.json({ ok: true })
  }

  if ('fal_api_key' in body) {
    const key = String(body.fal_api_key).trim()
    if (!key) return NextResponse.json({ error: 'Key cannot be empty' }, { status: 400 })
    await db.insert(settings)
      .values({ key: 'fal_api_key', value: key, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: key, updatedAt: new Date() } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown setting' }, { status: 400 })
}
