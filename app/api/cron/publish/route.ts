import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { articles, settings } from '@/lib/schema'
import { eq, and, lte, isNotNull } from 'drizzle-orm'

async function getTikTokToken(): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, 'tiktok_access_token'))
  const row = rows[0]
  if (!row) return null

  // Refresh if expiring within 2 hours
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)
  if (row.expiresAt && row.expiresAt < twoHoursFromNow) {
    const refreshRows = await db.select().from(settings).where(eq(settings.key, 'tiktok_refresh_token'))
    const refreshToken = refreshRows[0]?.value
    if (!refreshToken) return null

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: 'sbaw40li8y2qsgtgf6',
        client_secret: 'y6NtQKJZCr3pvdKOA694ZqxJ5F9yuQrd',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    const data = await res.json()
    if (!res.ok || data.error) return null

    const newToken = data.data?.access_token ?? data.access_token
    const expiresIn = Number(data.data?.expires_in ?? data.expires_in ?? 86400)
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await db.insert(settings).values({ key: 'tiktok_access_token', value: newToken, expiresAt, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: newToken, expiresAt, updatedAt: new Date() } })

    return newToken
  }
  return row.value
}

// Vercel Cron calls this every hour
// Secured by CRON_SECRET env var
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const results: Record<string, unknown>[] = []

  // Check if cron is enabled
  const cronSetting = await db.select().from(settings).where(eq(settings.key, 'cron_enabled'))
  if (cronSetting[0]?.value === 'false') {
    return NextResponse.json({ skipped: true, reason: 'cron disabled by admin' })
  }

  // Find articles scheduled for publish that haven't been published yet
  const due = await db.select().from(articles).where(
    and(
      eq(articles.status, 'draft'),
      isNotNull(articles.publishScheduledAt),
      lte(articles.publishScheduledAt, now),
    )
  )

  for (const article of due) {
    const log: Record<string, unknown> = { id: article.id, title: article.title, steps: {} }

    // 1. Publish to website
    await db.update(articles).set({
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    }).where(eq(articles.id, article.id))
    log.steps = { ...log.steps as object, website: 'published' }

    // 2. LINE Broadcast
    if (article.lineBroadcastMsg && !article.lineBroadcastSent) {
      const lineResult = await sendLine(article.lineBroadcastMsg)
      await db.update(articles).set({
        lineBroadcastSent: lineResult.ok,
        lineBroadcastAt: lineResult.ok ? now : undefined,
      }).where(eq(articles.id, article.id))
      log.steps = { ...log.steps as object, line: lineResult.ok ? 'sent' : `failed: ${lineResult.error}` }
    }

    // 3. Facebook
    if (article.fbCaption && !article.fbSent) {
      const fbResult = await postFacebook(article.fbCaption, article.fbHashtags ?? '')
      await db.update(articles).set({
        fbSent: fbResult.ok,
        fbSentAt: fbResult.ok ? now : undefined,
      }).where(eq(articles.id, article.id))
      log.steps = { ...log.steps as object, facebook: fbResult.ok ? 'sent' : `failed: ${fbResult.error}` }
    }

    // 4. Instagram
    if (article.igCaption && !article.igSent) {
      const igResult = await postInstagram(article.igCaption, article.igHashtags ?? '', article.coverImage ?? '')
      await db.update(articles).set({
        igSent: igResult.ok,
        igSentAt: igResult.ok ? now : undefined,
      }).where(eq(articles.id, article.id))
      log.steps = { ...log.steps as object, instagram: igResult.ok ? 'sent' : `failed: ${igResult.error}` }
    }

    // 5. TikTok (only if video URL is set)
    if (article.ttCaption && article.ttVideoUrl && !article.ttSent) {
      const ttResult = await postTikTok(article.ttCaption, article.ttHashtags ?? '', article.ttVideoUrl)
      await db.update(articles).set({
        ttSent: ttResult.ok,
        ttSentAt: ttResult.ok ? now : undefined,
      }).where(eq(articles.id, article.id))
      log.steps = { ...log.steps as object, tiktok: ttResult.ok ? 'sent' : `failed: ${ttResult.error}` }
    } else if (article.ttCaption && !article.ttVideoUrl) {
      log.steps = { ...log.steps as object, tiktok: 'skipped — no video URL' }
    }

    results.push(log)
  }

  return NextResponse.json({ processed: results.length, results })
}

// ─── Platform helpers ─────────────────────────────────────────────────────────

async function sendLine(message: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return { ok: false, error: 'LINE_CHANNEL_ACCESS_TOKEN not set' }
  try {
    const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: [{ type: 'text', text: message }] }),
    })
    if (!res.ok) {
      const err = await res.json()
      return { ok: false, error: JSON.stringify(err) }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

async function postFacebook(caption: string, hashtags: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.FB_PAGE_ACCESS_TOKEN
  const pageId = process.env.FB_PAGE_ID
  if (!token || !pageId) return { ok: false, error: 'FB_PAGE_ACCESS_TOKEN or FB_PAGE_ID not set' }
  try {
    const message = hashtags ? `${caption}\n\n${hashtags}` : caption
    const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: token }),
    })
    if (!res.ok) {
      const err = await res.json()
      return { ok: false, error: JSON.stringify(err) }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

async function postInstagram(caption: string, hashtags: string, imageUrl: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.FB_PAGE_ACCESS_TOKEN
  const igUserId = process.env.IG_USER_ID
  if (!token || !igUserId) return { ok: false, error: 'FB_PAGE_ACCESS_TOKEN or IG_USER_ID not set' }
  if (!imageUrl) return { ok: false, error: 'Instagram requires a cover image' }
  try {
    const text = hashtags ? `${caption}\n\n${hashtags}` : caption
    // Step 1: create media container
    const createRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption: text, access_token: token }),
    })
    if (!createRes.ok) {
      const err = await createRes.json()
      return { ok: false, error: JSON.stringify(err) }
    }
    const { id: creationId } = await createRes.json()

    // Step 2: publish
    const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: creationId, access_token: token }),
    })
    if (!publishRes.ok) {
      const err = await publishRes.json()
      return { ok: false, error: JSON.stringify(err) }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

async function postTikTok(caption: string, hashtags: string, videoUrl: string): Promise<{ ok: boolean; error?: string }> {
  const token = await getTikTokToken()
  if (!token) return { ok: false, error: 'TikTok token not found or refresh failed' }
  try {
    const text = hashtags ? `${caption} ${hashtags}` : caption
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        post_info: {
          title: text.slice(0, 2200),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
        post_mode: 'DIRECT_POST',
        media_type: 'VIDEO',
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      return { ok: false, error: JSON.stringify(err) }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
