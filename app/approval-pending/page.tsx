'use client';
import { GlassCard } from '@/components/UI';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function ApprovalPendingPage() {
    const router = useRouter();
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*') // Get everything to see what's wrong
                    .eq('id', user.id)
                    .single();

                setDebugInfo({ userId: user.id, email: user.email, profile, error });
            }
        };
        checkStatus();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: '#000',
            color: '#fff',
            padding: '1rem'
        }}>
            <GlassCard style={{ textAlign: 'center', maxWidth: '600px', border: '1px solid #333' }}>
                <h1 className="neon-text" style={{ color: 'var(--accent-warning)', marginBottom: '1rem' }}>
                    Approval Pending
                </h1>
                <p style={{ marginBottom: '2rem', color: '#ccc' }}>
                    Your account has been created successfully but requires administrator approval before you can access the dashboard.
                </p>
                <div style={{ padding: '1rem', background: 'rgba(255,255,0,0.1)', borderRadius: '8px', marginBottom: '2rem' }}>
                    <strong>Status:</strong> <span style={{ color: 'yellow' }}>Waiting for Review</span>
                </div>

                {/* Debug Info */}
                <div style={{ textAlign: 'left', background: '#111', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
                    <p style={{ color: '#888', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Debug Diagnostic Data:</p>
                    <pre style={{ margin: 0, color: '#0f0' }}>
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#333',
                            border: '1px solid #555',
                            color: '#fff',
                            padding: '0.8rem 1.5rem',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        Refresh Status
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#aaa',
                            padding: '0.8rem 1.5rem',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
