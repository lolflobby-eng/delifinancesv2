import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DeliveryLog, BeverageTransaction, InvestmentRecord, ExpenseCategory } from '@/lib/models';
import { GlassCard, NeonButton, NeonInput } from '@/components/UI';

interface InvestmentsProps {
    date: Date;
    currentBalance: number;
    logs: InvestmentRecord[];
    deliveryLogs: DeliveryLog[];
    beverageTrans: BeverageTransaction[];
    onUpdate: () => void;
    userId: string;
    t: any;
}

export default function InvestmentsTab({ date, currentBalance, logs, deliveryLogs, beverageTrans, onUpdate, userId, t }: InvestmentsProps) {
    const [amount, setAmount] = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [newCatName, setNewCatName] = useState('');
    const [isAddingCat, setIsAddingCat] = useState(false);

    // Percentage Calculator State
    const [percentToInvest, setPercentToInvest] = useState('20');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase.from('expense_categories').select('*').eq('type', 'investment');
        if (data) setCategories(data);
    };

    const handleAddCategory = async () => {
        if (!newCatName || !userId) return;
        const { error } = await supabase.from('expense_categories').insert({
            user_id: userId,
            name: newCatName,
            type: 'investment'
        });
        if (error) alert(error.message);
        else {
            setNewCatName(''); setIsAddingCat(false); fetchCategories();
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCat) return;
        if (!confirm(`${t.confirmDelete} "${selectedCat}"?`)) return;
        const cat = categories.find(c => c.name === selectedCat);
        if (cat) {
            const { error } = await supabase.from('expense_categories').delete().eq('id', cat.id);
            if (error) alert(error.message);
            else { setSelectedCat(''); fetchCategories(); }
        }
    };

    const handleInvest = async () => {
        if (!amount || !selectedCat || !userId) return;

        const val = parseFloat(amount);

        // 1. Log Investment
        const { error: invError } = await supabase.from('investments').insert({
            user_id: userId,
            category: selectedCat,
            amount: val,
            date: new Date().toISOString().split('T')[0]
        });

        if (invError) { alert(invError.message); return; }

        // 2. Deduct from Bank
        const { error: bankError } = await supabase.from('bank_records').insert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            balance: currentBalance - val, // New balance record
            notes: `Investment: ${selectedCat}`
        });

        if (bankError) alert("Investment logged but bank update failed: " + bankError.message);
        else {
            alert(t.investmentLogged);
            setAmount('');
            onUpdate();
        }
    };

    const handleDeleteInvestment = async (id: number) => {
        if (!confirm(t.confirmDelete)) return;

        // 1. Get the investment details first
        const { data: invData, error: fetchError } = await supabase.from('investments').select('amount').eq('id', id).single();
        if (fetchError || !invData) {
            alert("Could not fetch investment details.");
            return;
        }

        // 2. Delete the investment log
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (error) {
            alert(error.message);
            return;
        }

        // 3. Refund the Bank Balance (Add a correction record)
        const { error: bankError } = await supabase.from('bank_records').insert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            balance: currentBalance + invData.amount,
            notes: `Refund: Reverted Investment #${id}`
        });

        if (bankError) alert("Refund failed update bank manually: " + bankError.message);
        else {
            alert(t.refundMsg);
            onUpdate();
        }
    }

    // Helper for Timezone-Safe Month Check
    const isSameMonth = (dateStr: string, targetDate: Date) => {
        if (!dateStr) return false;
        const [y, m] = dateStr.split('-').map(Number);
        return y === targetDate.getFullYear() && (m - 1) === targetDate.getMonth();
    }

    // Monthly Logic
    const monthlyIncome = useMemo(() => {
        // Delivery Income
        const dIncome = deliveryLogs.filter(d => {
            return isSameMonth(d.date, date) && d.type === 'income';
        }).reduce((a, b) => a + b.amount, 0);

        // Beverage Sales
        const bIncome = beverageTrans.filter(b => {
            return isSameMonth(b.date, date) && b.type === 'sale';
        }).reduce((a, b) => a + b.total_amount, 0);

        // Delivery Expenses
        const dExp = deliveryLogs.filter(d => {
            return isSameMonth(d.date, date) && d.type === 'expense';
        }).reduce((a, b) => a + b.amount, 0);

        // Beverage Expenses
        const bExp = beverageTrans.filter(b => {
            return isSameMonth(b.date, date) && b.type === 'purchase';
        }).reduce((a, b) => a + b.total_amount, 0);

        return (dIncome + bIncome) - (dExp + bExp);
    }, [deliveryLogs, beverageTrans, date]);

    const smartSuggestion = monthlyIncome > 0 ? (monthlyIncome * (parseFloat(percentToInvest) / 100)) : 0;

    // Filter Logs for Display
    const filteredLogs = logs.filter(l => isSameMonth(l.date, date));

    return (
        <div className="fade-in">
            <h2 className="neon-text" style={{ marginBottom: '1rem', color: '#FF8888' }}>{t.investment} Hub</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <GlassCard>
                    <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{t.smartBanking}</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'gray', fontSize: '0.9rem' }}>
                            <span>{t.netMonthlyIncome}</span>
                            <span style={{ color: '#fff' }}>€{monthlyIncome.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                            <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{t.investPercent}</span>
                            <input
                                type="number"
                                value={percentToInvest}
                                onChange={e => setPercentToInvest(e.target.value)}
                                style={{ width: '50px', background: 'transparent', borderBottom: '1px solid #555', color: '#fff', textAlign: 'center' }}
                            />
                        </div>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.recommendedAction}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                            {t.move} €{smartSuggestion.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'gray' }}>{t.toPortfolio}</div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{t.portfolioDist}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {categories.map(c => {
                            const total = filteredLogs.filter(l => l.category === c.name).reduce((a, b) => a + b.amount, 0);
                            if (total === 0) return null;
                            return (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'gray' }}>{c.name}</span>
                                    <span style={{ color: '#fff' }}>€{total.toFixed(2)}</span>
                                </div>
                            )
                        })}
                        {categories.length === 0 && <p style={{ color: 'gray' }}>No categories defined.</p>}
                    </div>
                </GlassCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <GlassCard>
                    <h3 style={{ marginBottom: '1rem', color: '#FF8888' }}>{t.newInvestment}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <NeonInput placeholder={t.amount} type="number" value={amount} onChange={e => setAmount(e.target.value)} />

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                style={{ flex: 1, padding: '0.5rem', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
                                value={selectedCat}
                                onChange={e => setSelectedCat(e.target.value)}
                            >
                                <option value="">{t.selectAsset}</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            {(selectedCat && !isAddingCat) && (
                                <NeonButton onClick={handleDeleteCategory} variant="danger" style={{ padding: '0.5rem' }}>x</NeonButton>
                            )}
                            <NeonButton onClick={() => setIsAddingCat(!isAddingCat)} style={{ width: '40px' }}>+</NeonButton>
                        </div>

                        {isAddingCat && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <NeonInput placeholder="New Asset Class" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                                <NeonButton onClick={handleAddCategory}>Save</NeonButton>
                            </div>
                        )}

                        <NeonButton onClick={handleInvest} style={{ background: 'rgba(255, 136, 136, 0.1)', color: '#FF8888', border: '1px solid #FF8888' }}>
                            {t.executeOrder}
                        </NeonButton>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 style={{ marginBottom: '1rem' }}>{t.investmentLedger} ({date.toLocaleString('default', { month: 'long' })})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredLogs.map(log => (
                            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                                <div>
                                    <span style={{ color: '#FF8888', fontWeight: 'bold', marginRight: '1rem' }}>{log.category}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'gray' }}>{log.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>€{log.amount.toFixed(2)}</span>
                                    <button onClick={() => handleDeleteInvestment(log.id)} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                        {filteredLogs.length === 0 && <p style={{ color: 'gray' }}>No investment activity this month.</p>}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
