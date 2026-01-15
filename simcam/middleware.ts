import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname.toLowerCase();

    // Skip middleware for API routes and static files
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
        return NextResponse.next();
    }

    // REMOVED: Cookie cleaning logic that was causing redirect loops
    // The session management should be handled by NextAuth itself
    // If you need to clean cookies, do it client-side or through a dedicated API endpoint

    // Original lowercase path handling
    if (url.pathname !== pathname) {
        url.pathname = pathname;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}