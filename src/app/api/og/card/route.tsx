import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get('recipient') || 'Someone Special';
    const occasion = searchParams.get('occasion') || 'celebration';

    let occasionBadge = '💍 Holy Matrimony';
    if (occasion === 'anniversary') occasionBadge = '🥂 Happy Anniversary';
    if (occasion === 'birthday') occasionBadge = '🎂 Happy Birthday';
    if (occasion === 'eid') occasionBadge = '🌙 Eid Mubarak';
    if (occasion === 'congratulations') occasionBadge = '🏆 Warmest Congratulations';
    if (occasion === 'thankyou') occasionBadge = '🌿 Deepest Thanks';
    if (occasion === 'love') occasionBadge = '💖 Forever Yours';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1611',
            backgroundImage:
              'radial-gradient(circle at 50% 40%, #2f2719 0%, #17130d 100%)',
            padding: '40px',
            fontFamily: 'serif',
          }}
        >
          {/* Card Border */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1080px',
              height: '530px',
              backgroundColor: '#fbf9f4',
              borderRadius: '24px',
              border: '3px solid #d4af37',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              padding: '48px',
              position: 'relative',
            }}
          >
            {/* Occasion Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                color: '#8f6e16',
                padding: '8px 24px',
                borderRadius: '999px',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: 20,
              }}
            >
              {occasionBadge}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 26,
                color: '#776c5b',
                marginBottom: 12,
              }}
            >
              A Special Greeting for
            </div>

            {/* Recipient Name */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: '#2a2214',
                textAlign: 'center',
                lineHeight: 1.15,
                marginBottom: 24,
              }}
            >
              {recipient}
            </div>

            {/* Divider */}
            <div
              style={{
                width: '180px',
                height: '2px',
                backgroundColor: '#d4af37',
                marginBottom: 24,
              }}
            />

            {/* Callout */}
            <div
              style={{
                fontSize: 24,
                color: '#554a3a',
                fontStyle: 'italic',
                marginBottom: 28,
              }}
            >
              &ldquo;Tap the link to open and reveal your personal card 💌&rdquo;
            </div>

            {/* Footer brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 20,
                color: '#8f6e16',
                fontWeight: 600,
              }}
            >
              Shondhan Celebrations • Worldwide Link Sharing
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Failed to generate the image: ${message}`, {
      status: 500,
    });
  }
}
