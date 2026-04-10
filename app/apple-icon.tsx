import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #3b0d6e 0%, #7C3AED 60%, #A855F7 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: 110,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '-4px',
            textShadow: '0 4px 12px rgba(0,0,0,0.35)',
          }}
        >
          T
        </div>
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: 3,
            lineHeight: 1,
          }}
        >
          BIZ LAB
        </div>
      </div>
    ),
    { ...size },
  )
}
