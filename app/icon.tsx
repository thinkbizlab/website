import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #3b0d6e 0%, #7C3AED 60%, #A855F7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: 20,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-1px',
            lineHeight: 1,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size },
  )
}
