import { NextResponse } from 'next/server'

// Facebook requires this endpoint for apps using Facebook Login.
// When a user requests their data deleted from Facebook, Facebook calls this URL.
// Since ThinkBiz Lab only uses Facebook for posting (not storing user data from FB),
// we acknowledge the request and return a confirmation code.
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const signedRequest = params.get('signed_request') ?? ''

    // Parse the signed_request to get user_id (base64 encoded, second part)
    const parts = signedRequest.split('.')
    const payload = parts[1] ? JSON.parse(Buffer.from(parts[1], 'base64').toString()) : {}
    const userId = payload?.user_id ?? 'unknown'

    // Generate a confirmation code
    const confirmationCode = `TBL-${userId}-${Date.now()}`
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.thinkbizlab.com'

    return NextResponse.json({
      url: `${base}/api/auth/facebook/data-deletion/status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Status check page (Facebook may redirect users here)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code') ?? ''
  return NextResponse.json({
    status: 'processed',
    confirmation_code: code,
    message: 'Your data deletion request has been processed. ThinkBiz Lab does not store personal Facebook user data.',
  })
}
