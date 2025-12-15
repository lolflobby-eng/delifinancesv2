import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        'https://scxwoijurerfnbscfmeh.supabase.co',
        'sb_publishable_7OVF1WnvWz-npfym9KqIAA_7GlrqV8g',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    // Layouts strictly can't set cookies in Next.js Server Components,
                    // but we need the client for reading.
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Check Profile Approval
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.is_approved) {
        redirect('/approval-pending')
    }

    return (
        <>
            {children}
        </>
    )
}
