import { checkOllamaHealth, getActiveProvider } from '@/lib/ollama';
import { NextResponse } from 'next/server';

// GET /api/health - Check system health
export async function GET() {
    try {
        const aiStatus = await checkOllamaHealth();

        return NextResponse.json({
            success: true,
            status: 'ok',
            timestamp: new Date().toISOString(),
            activeProvider: getActiveProvider(),
            services: {
                ai: aiStatus,
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            status: 'degraded',
            timestamp: new Date().toISOString(),
            error: error.message,
        });
    }
}
