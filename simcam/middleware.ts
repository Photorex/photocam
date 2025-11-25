import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // console.log("Middleware executed. Original URL:", request.nextUrl.pathname);

    const url = request.nextUrl.clone();
    const pathname = url.pathname.toLowerCase();

    // Skip middleware for API routes and static files
    if (pathname.startsWith('/api/auth')) return NextResponse.next();
    
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/static/')) {
        return NextResponse.next();
    }

    // Check for both regular and secure prefixed session tokens
    const cleanedCookie = request.cookies.get('auth-cleaned');
    const sessionToken = request.cookies.get('next-auth.session-token');
    const secureSessionToken = request.cookies.get('__Secure-next-auth.session-token');
    
    // If we have any type of session token but haven't tried cleaning yet
    if ((sessionToken || secureSessionToken) && !cleanedCookie && !pathname.startsWith('/api/')) {
        const response = NextResponse.redirect(new URL('/', request.url));
        
        // Clear all variations of auth cookies
        // Regular cookies
        response.cookies.delete('next-auth.session-token');
        response.cookies.delete('next-auth.callback-url');
        response.cookies.delete('next-auth.csrf-token');
        
        // Secure prefixed cookies
        response.cookies.delete('__Secure-next-auth.session-token');
        response.cookies.delete('__Secure-next-auth.callback-url');
        response.cookies.delete('__Host-next-auth.csrf-token');
        
        // Set a flag cookie to prevent loops
        response.cookies.set('auth-cleaned', '1', { 
            maxAge: 60,
            path: '/',
            secure: true,
            sameSite: 'lax'
        });
        
        return response;
    }

    // Original lowercase path handling
    if (url.pathname !== pathname) {
        url.pathname = pathname;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}