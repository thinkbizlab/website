import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'ThinkBiz Lab'
  const category = searchParams.get('category') || ''

  const fontSize = title.length > 60 ? 42 : title.length > 40 ? 48 : 56

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0F0D1A 0%, #1a0f35 45%, #2D1B5E 100%)',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: 200,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'auto' }}>
          <div style={{
            fontSize: 18, fontWeight: 700, color: '#A78BFA',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            ThinkBiz Lab
          </div>
          {category && (
            <div style={{
              fontSize: 14, color: '#C4B5FD',
              background: 'rgba(124,58,237,0.25)',
              padding: '4px 14px', borderRadius: 20,
              border: '1px solid rgba(124,58,237,0.5)',
            }}>
              {category}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
        }}>
          <div style={{
            fontSize,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.3,
            maxWidth: '85%',
          }}>
            {title}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: 24,
          borderTop: '1px solid rgba(124,58,237,0.25)',
        }}>
          <div style={{ fontSize: 15, color: 'rgba(167,139,250,0.55)' }}>
            thinkbizlab.com
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            color: '#A78BFA',
            background: 'rgba(124,58,237,0.15)',
            padding: '6px 18px',
            borderRadius: 20,
          }}>
            ✦ Business Intelligence
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
