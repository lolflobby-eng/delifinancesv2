import React, { useMemo } from 'react';
import { DeliveryLog, BeverageTransaction } from '@/lib/models';
import { GlassCard } from '@/components/UI';

interface CalendarProps {
    date: Date;
    deliveryLogs: DeliveryLog[];
    beverageLogs: BeverageTransaction[];
    onDateChange: (d: Date) => void;
    t: any;
}

export default function CalendarView({ date, deliveryLogs, beverageLogs, onDateChange, t }: CalendarProps) {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Aggregate Daily Data
    const dailyData = useMemo(() => {
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDay = new Date(date.getFullYear(), date.getMonth(), i);
            const dateStr = currentDay.toISOString().split('T')[0];

            // Delivery
            const dIncome = deliveryLogs.filter(d => d.date === dateStr && d.type === 'income').reduce((a, b) => a + b.amount, 0);
            const dOrders = deliveryLogs.filter(d => d.date === dateStr && d.type === 'income').length; // Count Orders
            const dExp = deliveryLogs.filter(d => d.date === dateStr && d.type === 'expense').reduce((a, b) => a + b.amount, 0);

            // Beverages
            const bIncome = beverageLogs.filter(b => b.date === dateStr && b.type === 'sale').reduce((a, b) => a + b.total_amount, 0);
            const bExp = beverageLogs.filter(b => b.date === dateStr && b.type === 'purchase').reduce((a, b) => a + b.total_amount, 0);

            const totalIncome = dIncome + bIncome;
            const totalExpense = dExp + bExp;

            days.push({
                day: i,
                date: currentDay,
                income: totalIncome,
                expense: totalExpense,
                profit: totalIncome - totalExpense,
                orders: dOrders
            });
        }
        return days;
    }, [date, deliveryLogs, beverageLogs, daysInMonth]);

    // Calculate Max for color scaling
    const maxIncome = Math.max(...dailyData.map(d => d.income), 1);

    const bestDay = dailyData.reduce((prev, current) => (prev.income > current.income) ? prev : current, dailyData[0]);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="neon-text">{t.dailyPerf}</h2>
            </div>

            {/* Best Day Highlight */}
            <GlassCard style={{ marginBottom: '2rem', border: '1px solid var(--accent-success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }}>Best Day: {bestDay?.date.toLocaleDateString()}</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>€{bestDay?.income.toFixed(2)}</div>
                        <div style={{ fontSize: '0.9rem', color: 'gray' }}>{bestDay?.orders} {t.orders}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'gray' }}>{t.profit}</div>
                        <div style={{ fontSize: '1.5rem', color: '#fff' }}>€{bestDay?.profit.toFixed(2)}</div>
                    </div>
                </div>
            </GlassCard>

            {/* Grid Calendar */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem'
            }}>
                {dailyData.map((d) => {
                    const intensity = (d.income / maxIncome);
                    return (
                        <div key={d.day} style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            padding: '0.8rem',
                            border: d.day === bestDay.day ? '2px solid var(--accent-success)' : '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '100px'
                        }}>
                            {/* Heatmap background */}
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, width: '100%',
                                height: `${intensity * 100}%`,
                                background: `linear-gradient(to top, rgba(255,42,42,0.15), transparent)`,
                                pointerEvents: 'none'
                            }} />

                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'gray' }}>
                                        {d.date.toLocaleString('default', { weekday: 'short' })} {d.day}
                                    </span>
                                    {d.orders > 0 && (
                                        <span style={{ fontSize: '0.7rem', background: '#333', padding: '2px 4px', borderRadius: '4px', color: '#fff' }}>
                                            {d.orders} {t.orders.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>
                                        +€{d.income.toFixed(0)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'gray', marginTop: '4px' }}>
                                        <span>{t.netIncome}:</span>
                                        <span style={{ color: d.profit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>€{d.profit.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
