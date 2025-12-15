import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Hardcoded keys to prevent 500 Error in Edge Runtime
    const supabaseUrl = 'https://scxwoijurerfnbscfmeh.supabase.co';
    const supabaseKey = 'sb_publishable_7OVF1WnvWz-npfym9KqIAA_7GlrqV8g';

    let supabase;
    try {
        supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet: { name: string, value: string, options: any }[]) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )
    } catch (e) {
        // If client creation fails, passthrough
        return supabaseResponse
    }

    // Do not run Supabase middleware to protect /auth to allow login
    if (request.nextUrl.pathname.startsWith('/auth')) {
        return supabaseResponse
    }

    if (!supabase) return supabaseResponse;

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/auth'
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
