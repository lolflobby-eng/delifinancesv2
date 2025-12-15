'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/auth');
                return;
            }

            // Check Profile Approval
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_approved')
                .eq('id', user.id)
                .single();

            if (!profile || !profile.is_approved) {
                router.replace('/approval-pending');
            }

            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: '#fff'
            }}>
                Checking Access Permissions...
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
