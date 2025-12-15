'use client';
import { GlassCard } from '@/components/UI';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ApprovalPendingPage() {
    const router = useRouter();

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
            background: '#000',
            color: '#fff'
        }}>
            <GlassCard style={{ textAlign: 'center', maxWidth: '500px', border: '1px solid #333' }}>
                <h1 className="neon-text" style={{ color: 'var(--accent-warning)', marginBottom: '1rem' }}>
                    Approval Pending
                </h1>
                <p style={{ marginBottom: '2rem', color: '#ccc' }}>
                    Your account has been created successfully but requires administrator approval before you can access the dashboard.
                </p>
                <div style={{ padding: '1rem', background: 'rgba(255,255,0,0.1)', borderRadius: '8px', marginBottom: '2rem' }}>
                    <strong>Status:</strong> <span style={{ color: 'yellow' }}>Waiting for Review</span>
                </div>
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
            </GlassCard>
        </div>
    );
}
