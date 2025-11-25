import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/app/lib/version';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recovering...</title>
      <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate" />
      <script>
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach(function(c) {
          if (!c.trim().startsWith('next-auth')) {
            document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
          }
        });
        window.location.href = '/?fresh=' + Date.now();
      </script>
    </head>
    <body style="font-family:system-ui; text-align:center; margin-top:100px">
      <h2>Refreshing application...</h2>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
} 