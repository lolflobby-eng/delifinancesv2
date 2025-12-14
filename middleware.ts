import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // TEMPORARY FIX: Bypassing auth check to verify site can load (fixing 500 error)
    // return await updateSession(request)
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - logo.png (public images)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
