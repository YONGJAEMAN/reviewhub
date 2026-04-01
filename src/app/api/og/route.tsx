import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'ReviewHub';
  const description = searchParams.get('description') || '모든 리뷰, 하나의 대시보드';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #1B3A4B 0%, #0F2430 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#2E86C1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              marginRight: 16,
            }}
          >
            R
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, opacity: 0.8 }}>ReviewHub</span>
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 20,
            maxWidth: 800,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 24, opacity: 0.7, maxWidth: 700 }}>{description}</div>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 80,
            fontSize: 18,
            opacity: 0.5,
          }}
        >
          reviewhub.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
