import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        // ?title=<title>&score=<score>&light=<light>
        const title = searchParams.get('title') || 'Validated Startup Idea'
        const score = searchParams.get('score') || '??'
        const light = searchParams.get('light') || 'green'

        const lightColors = {
            green: '#22c55e',
            yellow: '#eab308',
            red: '#ef4444'
        }

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
                        backgroundColor: '#f8fafc',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #e2e8f0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e2e8f0 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        padding: '80px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'white',
                            borderRadius: '40px',
                            padding: '60px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            border: '1px solid #e2e8f0',
                            width: '900px',
                            height: '450px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div
                                    style={{
                                        fontSize: '20px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.2em',
                                        color: '#2563eb',
                                        marginBottom: '10px',
                                    }}
                                >
                                    Venlidate Report
                                </div>
                                <div
                                    style={{
                                        fontSize: '48px',
                                        fontWeight: '900',
                                        color: '#0f172a',
                                        lineHeight: '1.1',
                                        maxWidth: '550px',
                                    }}
                                >
                                    {title}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <div style={{ fontSize: '16px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                    Overall Score
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                    <div style={{ fontSize: '80px', fontWeight: '900', color: '#2563eb' }}>{score}</div>
                                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#cbd5e1' }}>/100</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', marginTop: 'auto', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: lightColors[light as keyof typeof lightColors] || lightColors.green,
                                        boxShadow: `0 0 15px ${lightColors[light as keyof typeof lightColors] || lightColors.green}`,
                                    }}
                                />
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#64748b' }}>
                                    Validated Build-Ready
                                </div>
                            </div>
                            <div style={{ display: 'flex', fontSize: '24px', fontWeight: '900', color: '#2563eb' }}>
                                venlidate.com
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        console.log(message)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
