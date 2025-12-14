import React, { useMemo } from 'react';
import { DeliveryLog, BeverageTransaction, InvestmentRecord } from '@/lib/models';
import { GlassCard } from '@/components/UI';

interface StrategyProps {
    deliveryLogs: DeliveryLog[];
    beverageTrans: BeverageTransaction[];
    investments: InvestmentRecord[];
    t: any;
}

export default function StrategyTab({ deliveryLogs, beverageTrans, investments, t }: StrategyProps) {
    const netIncome = useMemo(() => {
        // Calculate Global Net Income (Delivery + Beverages)
        const dIncome = deliveryLogs.filter(d => d.type === 'income').reduce((a, b) => a + b.amount, 0);
        const dExp = deliveryLogs.filter(d => d.type === 'expense').reduce((a, b) => a + b.amount, 0);
        const bIncome = beverageTrans.filter(b => b.type === 'sale').reduce((a, b) => a + b.total_amount, 0);
        const bExp = beverageTrans.filter(b => b.type === 'purchase').reduce((a, b) => a + b.total_amount, 0);

        return (dIncome + bIncome) - (dExp + bExp);
    }, [deliveryLogs, beverageTrans]);

    // AI Heuristics
    const strategies = useMemo(() => {
        const list = [];
        if (netIncome < 1000) {
            list.push({ title: t.strat_aggressive, desc: t.strat_aggressive_desc, impact: 'High' });
        }
        if (beverageTrans.length < deliveryLogs.length * 0.1) {
            list.push({ title: t.strat_bev, desc: t.strat_bev_desc, impact: 'Medium' });
        }
        if (netIncome > 5000) {
            list.push({ title: t.strat_reserve, desc: t.strat_reserve_desc, impact: 'Low' });
        }
        return list;
    }, [netIncome, deliveryLogs, beverageTrans, t]);

    // 40/30/20/10 Split
    const allocation = {
        reinvest: netIncome * 0.40,
        salary: netIncome * 0.30,
        emergency: netIncome * 0.20,
        buffer: netIncome * 0.10
    };

    return (
        <div className="fade-in">
            <h2 className="neon-text" style={{ marginBottom: '2rem' }}>{t.aiCenter}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Profit Allocation Engine */}
                <GlassCard>
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{t.optProfitAlloc}</h3>
                    <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {t.allocDesc} <span style={{ color: '#fff' }}>€{netIncome.toFixed(2)}</span>, {t.aiRecommend}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <AllocationBar label={t.reinvest} amount={allocation.reinvest} color="#FF2A2A" />
                        <AllocationBar label={t.salary} amount={allocation.salary} color="#00C851" />
                        <AllocationBar label={t.emergency} amount={allocation.emergency} color="#FFBB33" />
                        <AllocationBar label={t.buffer} amount={allocation.buffer} color="#33B5E5" />
                    </div>
                </GlassCard>

                {/* Growth Projections */}
                <GlassCard>
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{t.growthProj}</h3>
                    <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '1rem' }}>{t.projDesc}</p>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '1rem' }}>
                        {/* Mock Projection Bars */}
                        {[1, 1.2, 1.35, 1.6].map((mult, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '80%',
                                    height: `${40 * mult}%`,
                                    background: i === 3 ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px'
                                }} />
                                <span style={{ fontSize: '0.8rem', color: 'gray', marginTop: '5px' }}>Q{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Actionable Strategies */}
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>{t.actionableIntel}</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {strategies.map((s, i) => (
                    <div key={i} style={{
                        background: 'rgba(0,0,0,0.6)',
                        borderLeft: '4px solidvar(--accent-primary)',
                        padding: '1.5rem',
                        borderRadius: '0 8px 8px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>{s.title}</h4>
                            <p style={{ color: 'gray', fontSize: '0.9rem' }}>{s.desc}</p>
                        </div>
                        <button style={{
                            background: 'var(--accent-primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>{t.execute}</button>
                    </div>
                ))}
                {strategies.length === 0 && <p style={{ color: 'gray' }}>{t.dataInsufficient}</p>}
            </div>
        </div>
    );
}

const AllocationBar = ({ label, amount, color }: { label: string, amount: number, color: string }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
            <span style={{ color: '#ddd' }}>{label}</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>€{amount.toFixed(0)}</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: color, borderRadius: '4px' }} />
        </div>
    </div>
)
