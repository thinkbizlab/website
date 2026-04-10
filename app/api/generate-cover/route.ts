import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { settings } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// Build a photography-style prompt from article title + category
function buildPrompt(title: string, category: string): string {
  const categoryPrompts: Record<string, string> = {
    'Strategy':    'corporate strategy meeting, business professionals in modern office, aerial city view',
    'Finance':     'financial charts, stock market data, business analytics dashboard, coins and graphs',
    'Marketing':   'digital marketing concept, social media screens, creative agency, colorful campaign',
    'Startup':     'startup office culture, entrepreneurs working, innovation lab, tech workspace',
    'SME':         'small business owner, local shop, entrepreneur portrait, Thai business environment',
    'Investment':  'investment portfolio, real estate, stock exchange floor, wealth management',
    'AI & Tech':   'artificial intelligence visualization, futuristic technology, neural network, digital transformation',
    'Global Case': 'global business, world map, international trade, multicultural team meeting',
  }

  const base = categoryPrompts[category] || 'business professionals, modern corporate environment, success concept'
  return `Professional editorial photograph for business article about "${title}". ${base}. High quality DSLR photo, natural lighting, sharp focus, magazine cover style, 16:9 aspect ratio, photorealistic.`
}

async function getFalKey(): Promise<string> {
  // DB key takes precedence over env var
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, 'fal_api_key'))
    if (rows[0]?.value) return rows[0].value
  } catch { /* ignore */ }
  return process.env.FAL_KEY ?? ''
}

// Fallback: generate a simple gradient PNG using SVG → canvas trick
// Returns a minimal SVG-based image as PNG bytes
function buildFallbackSvg(title: string, category: string): string {
  const safe = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const words = title.split(' ')
  // Split into up to 3 lines of ~5 words
  const lines: string[] = []
  for (let i = 0; i < words.length; i += 5) {
    lines.push(words.slice(i, i + 5).join(' '))
    if (lines.length >= 3) break
  }
  const lineY = [220, 270, 320]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F0D1A"/>
      <stop offset="50%" style="stop-color:#1E1030"/>
      <stop offset="100%" style="stop-color:#2D1654"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7C3AED"/>
      <stop offset="100%" style="stop-color:#A855F7"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Decorative circles -->
  <circle cx="1050" cy="100" r="300" fill="#7C3AED" opacity="0.08"/>
  <circle cx="150" cy="530" r="200" fill="#A855F7" opacity="0.06"/>
  <!-- Top accent bar -->
  <rect x="60" y="60" width="120" height="4" rx="2" fill="url(#accent)"/>
  <!-- Category badge -->
  <rect x="60" y="85" width="${Math.min(category.length * 11 + 32, 220)}" height="28" rx="14" fill="#7C3AED" opacity="0.3"/>
  <text x="76" y="104" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#C4B5FD" letter-spacing="1">${safe(category.toUpperCase())}</text>
  <!-- Title lines -->
  ${lines.map((line, i) => `<text x="60" y="${lineY[i] ?? 360}" font-family="Arial Black, Arial, sans-serif" font-size="${lines.length > 2 ? 52 : 60}" font-weight="900" fill="white" opacity="0.95">${safe(line)}</text>`).join('\n  ')}
  <!-- Bottom accent -->
  <rect x="60" y="540" width="60" height="3" rx="1.5" fill="url(#accent)"/>
  <text x="60" y="575" font-family="Arial, sans-serif" font-size="16" fill="#9B8EC4" opacity="0.6">ThinkBiz Lab</text>
</svg>`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'ThinkBiz Lab'
  const category = searchParams.get('category') || ''

  const falKey = await getFalKey()

  // ── No fal.ai key: return error JSON so form shows real message ──────
  if (!falKey) {
    return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })
  }

  // ── fal.ai Flux Schnell ──────────────────────────────────────────────
  const prompt = buildPrompt(title, category)

  try {
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: { width: 1200, height: 630 },
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `fal.ai error: ${err}` }, { status: 500 })
    }

    const data = await res.json()
    const imageUrl: string = data?.images?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned from fal.ai' }, { status: 500 })
    }

    // Fetch the image and stream it back
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Failed to fetch generated image: ${imgRes.status}` }, { status: 500 })
    }

    const buffer = await imgRes.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
