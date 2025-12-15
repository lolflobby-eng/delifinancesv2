'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GlassCard, NeonButton } from './UI';

export default function AdminTab() {
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_approved', false);

        if (data) setPendingUsers(data);
        setLoading(false);
    };

    const handleApprove = async (id: string, email: string) => {
        if (!confirm(`Approve access for ${email}?`)) return;

        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: true })
            .eq('id', id);

        if (error) {
            alert('Error approving user: ' + error.message);
        } else {
            fetchPendingUsers();
        }
    };

    return (
        <div className="fade-in">
            <h2 className="neon-text" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Admin Panel</h2>

            <GlassCard>
                <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Pending Approvals</h3>
                {loading ? <p>Loading...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {pendingUsers.length === 0 ? (
                            <p style={{ color: 'gray' }}>No pending users found.</p>
                        ) : (
                            pendingUsers.map(u => (
                                <div key={u.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    border: '1px solid #333'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{u.email}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'gray' }}>ID: {u.id}</div>
                                    </div>
                                    <NeonButton
                                        onClick={() => handleApprove(u.id, u.email)}
                                        variant="success"
                                        style={{ padding: '0.5rem 1.5rem' }}
                                    >
                                        Approve
                                    </NeonButton>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
