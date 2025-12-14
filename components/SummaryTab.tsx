import React, { useMemo, useState } from 'react';
import { DeliveryLog, BeverageTransaction, InvestmentRecord } from '@/lib/models';
import { GlassCard, NeonButton } from '@/components/UI';

interface SummaryProps {
    date: Date;
    deliveryLogs: DeliveryLog[];
    beverageTrans: BeverageTransaction[];
    investments: InvestmentRecord[];
    t: any;
}

type TimeRange = '1M' | '3M' | '1Y' | 'ALL';

export default function SummaryTab({ date, deliveryLogs, beverageTrans, investments, t }: SummaryProps) {
    const [range, setRange] = useState<TimeRange>('1M');

    // Helper to check if date in range
    const isInRange = (dateStr: string) => {
        if (!dateStr) return false;
        const recordDate = new Date(dateStr);
        const now = new Date();

        switch (range) {
            case '1M':
                // Use the Global "date" prop for the specific month view
                return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear();
            case '3M':
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(now.getMonth() - 3);
                return recordDate >= threeMonthsAgo;
            case '1Y':
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                return recordDate >= oneYearAgo;
            case 'ALL':
                return true;
            default:
                return false;
        }
    };

    const filteredData = useMemo(() => {
        const dLogs = deliveryLogs.filter(d => isInRange(d.date));
        const bTrans = beverageTrans.filter(b => isInRange(b.date));
        const inv = investments.filter(i => isInRange(i.date));
        return { dLogs, bTrans, inv };
    }, [range, date, deliveryLogs, beverageTrans, investments]);

    const stats = useMemo(() => {
        // Delivery
        const dIncome = filteredData.dLogs.filter(d => d.type === 'income').reduce((a, b) => a + b.amount, 0);
        const dExp = filteredData.dLogs.filter(d => d.type === 'expense').reduce((a, b) => a + b.amount, 0);

        // Beverages
        const bIncome = filteredData.bTrans.filter(b => b.type === 'sale').reduce((a, b) => a + b.total_amount, 0);
        const bExp = filteredData.bTrans.filter(b => b.type === 'purchase').reduce((a, b) => a + b.total_amount, 0);

        // Investment
        const totalInvested = filteredData.inv.reduce((a, b) => a + b.amount, 0);
        // Note: Investments are technically "expenses" when moving cash out, but here tracked separately as Assets.

        const totalRevenue = dIncome + bIncome;
        const totalOpCosts = dExp + bExp;
        const globalProfit = totalRevenue - totalOpCosts; // Net Operating Profit
        const cashFlow = globalProfit - totalInvested; // Net Flow (Cash in Hand after Invest)

        // ROI = (Net Profit / Total Costs) * 100. Costs = Ops Costs + Investments? Or just Ops? 
        // Typically ROI is on *Investment* or Margin on *Sales*. 
        // Here we'll do Net Margin = (Profit / Revenue)
        const profitMargin = totalRevenue > 0 ? (globalProfit / totalRevenue * 100).toFixed(1) : '0.0';

        return {
            totalRevenue,
            totalOpCosts,
            globalProfit,
            totalInvested,
            cashFlow,
            dIncome, dExp,
            bIncome, bExp,
            profitMargin
        };
    }, [filteredData]);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="neon-text" style={{ margin: 0 }}>{t.execDashboard}</h2>

                {/* Range Selector */}
                <div className="glass-panel" style={{ padding: '0.3rem', display: 'flex', gap: '0.5rem' }}>
                    <RangeBtn active={range === '1M'} onClick={() => setRange('1M')}>{t.range1M}</RangeBtn>
                    <RangeBtn active={range === '3M'} onClick={() => setRange('3M')}>{t.range3M}</RangeBtn>
                    <RangeBtn active={range === '1Y'} onClick={() => setRange('1Y')}>{t.range1Y}</RangeBtn>
                    <RangeBtn active={range === 'ALL'} onClick={() => setRange('ALL')}>{t.rangeAll}</RangeBtn>
                </div>
            </div>

            {/* Key Metrics Rows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.globalProfit}</div>
                    <div style={{ fontSize: '1.8rem', color: stats.globalProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        €{stats.globalProfit.toFixed(2)}
                    </div>
                </GlassCard>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.netFlow}</div>
                    <div style={{ fontSize: '1.8rem', color: stats.cashFlow >= 0 ? 'var(--accent-primary)' : 'orange' }}>
                        €{stats.cashFlow.toFixed(2)}
                    </div>
                </GlassCard>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.invested}</div>
                    <div style={{ fontSize: '1.8rem', color: '#fff' }}>
                        €{stats.totalInvested.toFixed(2)}
                    </div>
                </GlassCard>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>Margin</div>
                    <div style={{ fontSize: '1.8rem', color: 'cyan' }}>
                        {stats.profitMargin}%
                    </div>
                </GlassCard>
            </div>

            {/* Detailed Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <GlassCard>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>{t.financialBreakdown}</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'gray', fontSize: '0.9rem' }}>
                                <th style={{ padding: '0.5rem 0' }}>{t.source}</th>
                                <th style={{ textAlign: 'right' }}>{t.totalRevenue}</th>
                                <th style={{ textAlign: 'right' }}>{t.totalOpCost}</th>
                                <th style={{ textAlign: 'right' }}>{t.net}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.8rem 0' }}>{t.delivery}</td>
                                <td style={{ textAlign: 'right', color: 'var(--accent-success)' }}>+€{stats.dIncome.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', color: 'var(--accent-danger)' }}>-€{stats.dExp.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>€{(stats.dIncome - stats.dExp).toFixed(2)}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.8rem 0' }}>{t.beverages}</td>
                                <td style={{ textAlign: 'right', color: 'var(--accent-success)' }}>+€{stats.bIncome.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', color: 'var(--accent-danger)' }}>-€{stats.bExp.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>€{(stats.bIncome - stats.bExp).toFixed(2)}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.8rem 0' }}>{t.investment}</td>
                                <td style={{ textAlign: 'right', color: 'gray' }}>-</td>
                                <td style={{ textAlign: 'right', color: '#fff' }}>€{stats.totalInvested.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'gray' }}>-</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', borderTop: '2px solid #444' }}>
                                <td style={{ padding: '1rem 0' }}>{t.total}</td>
                                <td style={{ textAlign: 'right', color: 'var(--accent-success)' }}>€{stats.totalRevenue.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', color: 'var(--accent-danger)' }}>€{(stats.totalOpCosts + stats.totalInvested).toFixed(2)}</td>
                                <td style={{ textAlign: 'right', color: 'var(--accent-primary)' }}>€{stats.cashFlow.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </GlassCard>

                <GlassCard>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>{t.globalUnitEco}</h3>
                    {/* Using HTML/CSS Chart for visual impact */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '20px', padding: '1rem 0' }}>
                        <Bar label={t.totalRevenue} value={stats.totalRevenue} max={stats.totalRevenue * 1.2} color="var(--accent-success)" />
                        <Bar label={t.totalOpCost} value={stats.totalOpCosts} max={stats.totalRevenue * 1.2} color="var(--accent-danger)" />
                        <Bar label={t.globalProfit} value={stats.globalProfit} max={stats.totalRevenue * 1.2} color="var(--accent-primary)" />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

const RangeBtn = ({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) => (
    <button
        onClick={onClick}
        style={{
            background: active ? 'var(--accent-primary)' : 'transparent',
            color: active ? '#fff' : 'gray',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: active ? 'bold' : 'normal'
        }}
    >
        {children}
    </button>
)

const Bar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => {
    const safeMax = max || 1;
    const height = Math.min(Math.max((value / safeMax) * 100, 5), 100); // Clamp between 5% and 100%
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                    width: '100%',
                    height: `${height}%`,
                    background: color,
                    borderRadius: '4px 4px 0 0',
                    boxShadow: `0 0 10px ${color}40`,
                    transition: 'height 0.5s ease'
                }} />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'gray', textAlign: 'center' }}>{label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>€{value.toFixed(0)}</div>
        </div>
    )
}
