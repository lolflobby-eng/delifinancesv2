'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { GlassCard, NeonButton, NeonInput } from '@/components/UI';

export default function AuthPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email, password,
                });
                if (error) throw error;
                router.push('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email, password,
                });
                if (error) throw error;
                alert('Check your email for confirmation!');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Red Theme Override
    const redTheme = {
        '--accent-primary': '#FF2A2A',
        '--accent-secondary': '#FF5555',
        '--neon-glow-primary': '0 0 10px rgba(255, 42, 42, 0.5)',
        '--accent-danger': '#FF2A2A'
    } as React.CSSProperties;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #220000 0%, #000 100%)', // Red-ish dark background
            ...redTheme
        }}>
            <GlassCard style={{ maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid rgba(255, 42, 42, 0.3)' }}>
                {/* Logo Section */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <img src="/logo.png" alt="Deligos Logo" style={{ width: '120px', height: 'auto', borderRadius: '50%', boxShadow: '0 0 20px rgba(255, 42, 42, 0.2)' }} />
                </div>

                <h1 className="neon-text" style={{ marginBottom: '2rem', fontSize: '1.8rem', textTransform: 'uppercase' }}>
                    <span style={{ color: '#FF2A2A', textShadow: '0 0 10px #FF2A2A' }}>Deligos</span> Finance <br /> Access
                </h1>

                {error && (
                    <div style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid #FF2A2A',
                        color: '#FF5555',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <NeonInput type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <NeonInput type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <NeonButton style={{ marginTop: '1rem', background: 'rgba(255, 42, 42, 0.1)', color: '#FF2A2A', border: '1px solid #FF2A2A' }}>
                        {loading ? 'Authenticating...' : (isLogin ? 'Enter System' : 'Register Identity')}
                    </NeonButton>
                </form>

                <p style={{ marginTop: '1.5rem', color: 'gray', fontSize: '0.9rem' }}>
                    {isLogin ? "New to Deligos? " : "Already verified? "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: '#FF8888', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isLogin ? 'Create Account' : 'Login'}
                    </span>
                </p>
            </GlassCard>
        </div>
    );
}
