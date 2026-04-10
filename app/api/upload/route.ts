import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filename = searchParams.get('filename')
  if (!filename) return NextResponse.json({ error: 'filename required' }, { status: 400 })

  try {
    // Read body into buffer first — avoids ReadableStream issues with edge-origin responses
    const arrayBuffer = await req.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const blob = await put(`articles/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType: req.headers.get('content-type') ?? 'image/jpeg',
    })

    return NextResponse.json({ url: blob.url })
  } catch (e) {
    console.error('[upload] put() failed:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
