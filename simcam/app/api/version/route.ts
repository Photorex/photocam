import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/app/lib/version';

export async function GET() {
  return NextResponse.json(
    { 
      version: APP_VERSION,
      timestamp: Date.now() 
    },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
} 