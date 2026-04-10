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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'ThinkBiz Lab'
  const category = searchParams.get('category') || ''

  const falKey = await getFalKey()
  if (!falKey) {
    return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })
  }

  const prompt = buildPrompt(title, category)

  try {
    // Submit to fal.ai flux/schnell
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
    if (!imgRes.ok) return NextResponse.json({ error: 'Failed to fetch generated image' }, { status: 500 })

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
