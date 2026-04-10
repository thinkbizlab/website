import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { settings } from '@/lib/schema'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/admin/tiktok?error=${error ?? 'no_code'}`, req.url)
    )
  }

  try {
    const body = new URLSearchParams({
      client_key: 'sbaw40li8y2qsgtgf6',
      client_secret: 'y6NtQKJZCr3pvdKOA694ZqxJ5F9yuQrd',
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://www.thinkbizlab.com/api/auth/tiktok/callback',
    })

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body,
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      const errDetail = encodeURIComponent(JSON.stringify(data))
      return NextResponse.redirect(
        new URL(`/admin/tiktok?error=${errDetail}`, req.url)
      )
    }

    const accessToken = data.data?.access_token ?? data.access_token
    const refreshToken = data.data?.refresh_token ?? data.refresh_token
    const expiresIn = Number(data.data?.expires_in ?? data.expires_in ?? 86400)
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Save to DB
    await db.insert(settings).values({ key: 'tiktok_access_token', value: accessToken, expiresAt, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: accessToken, expiresAt, updatedAt: new Date() } })
    await db.insert(settings).values({ key: 'tiktok_refresh_token', value: refreshToken, expiresAt: null, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: refreshToken, updatedAt: new Date() } })

    return NextResponse.redirect(new URL('/admin/tiktok?success=1', req.url))
  } catch (e) {
    return NextResponse.redirect(
      new URL(`/admin/tiktok?error=${String(e)}`, req.url)
    )
  }
}
