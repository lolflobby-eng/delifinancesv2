import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DeliveryLog, ExpenseCategory } from '@/lib/models';
import { GlassCard, NeonButton, NeonInput } from '@/components/UI';

export default function DeliveryTab({ logs, onUpdate, date, userId, t }: { logs: DeliveryLog[], onUpdate: () => void, date: Date, userId: string, t: any }) {
    const [incomePrice, setIncomePrice] = useState('');
    const [incomeCommission, setIncomeCommission] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');

    // Date States
    const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [newCatName, setNewCatName] = useState('');
    const [isAddingCat, setIsAddingCat] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase.from('expense_categories').select('*').eq('type', 'delivery');
        if (data) setCategories(data);
    };

    // Filter Logs by Date
    const filteredLogs = useMemo(() => {
        return logs.filter(l => {
            const logDate = new Date(l.date);
            return logDate.getMonth() === date.getMonth() && logDate.getFullYear() === date.getFullYear();
        });
    }, [logs, date]);

    const handleSaveIncome = async () => {
        if (!incomePrice || !incomeCommission || !userId) return;
        const total = parseFloat(incomePrice) + parseFloat(incomeCommission);

        const { error } = await supabase.from('delivery_logs').insert({
            user_id: userId,
            type: 'income',
            commission_profit: parseFloat(incomeCommission),
            description: 'Delivery Income',
            date: incomeDate
        });

        if (error) alert(error.message);
        else {
            setIncomePrice('');
            setIncomePrice('');
            setIncomeCommission('');
            // Keep date as is or reset? Usually nicer to keep if entering many for same day, but requirement handles "backdating" mainly.
            onUpdate();
        }
    };

    const handleSaveExpense = async () => {
        if (!expenseAmount || !expenseCategory || !userId) return;

        const { error } = await supabase.from('delivery_logs').insert({
            user_id: userId,
            type: 'expense',
            amount: parseFloat(expenseAmount),
            category: expenseCategory,
            description: expenseCategory,
            date: expenseDate
        });

        if (error) alert(error.message);
        else {
            setExpenseAmount('');
            onUpdate();
        }
    };

    const handleAddCategory = async () => {
        if (!newCatName || !userId) return;
        const { error } = await supabase.from('expense_categories').insert({
            user_id: userId,
            name: newCatName,
            type: 'delivery'
        });
        if (error) alert(error.message);
        else {
            setNewCatName('');
            setIsAddingCat(false);
            fetchCategories();
        }
    };

    const handleDeleteCategory = async () => {
        if (!expenseCategory) return;
        if (!confirm(`${t.confirmDelete} "${expenseCategory}"?`)) return;

        // Find ID
        const cat = categories.find(c => c.name === expenseCategory);
        if (cat) {
            const { error } = await supabase.from('expense_categories').delete().eq('id', cat.id);
            if (error) alert(error.message);
            else {
                setExpenseCategory('');
                fetchCategories();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.confirmDelete)) return;
        const { error } = await supabase.from('delivery_logs').delete().eq('id', id);
        if (error) alert(error.message);
        else onUpdate();
    }

    // Stats
    const totalOrders = filteredLogs.filter(l => l.type === 'income').length;
    const totalIncome = filteredLogs.filter(l => l.type === 'income').reduce((acc, l) => acc + l.amount, 0);
    const totalExpense = filteredLogs.filter(l => l.type === 'expense').reduce((acc, l) => acc + l.amount, 0);
    const netProfit = totalIncome - totalExpense;
    const roi = totalExpense > 0 ? ((netProfit / totalExpense) * 100).toFixed(1) : '∞';

    return (
        <div className="fade-in">
            <h2 className="neon-text" style={{ marginBottom: '1rem' }}>{t.delivery}</h2>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.totalOrders} ({date.toLocaleString('default', { month: 'short' })})</div>
                    <div style={{ fontSize: '1.8rem', color: '#fff' }}>{totalOrders}</div>
                </GlassCard>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.netProfit}</div>
                    <div style={{ fontSize: '1.8rem', color: netProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        €{netProfit.toFixed(2)}
                    </div>
                </GlassCard>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.roi}</div>
                    <div style={{ fontSize: '1.8rem', color: 'var(--accent-primary)' }}>{roi}%</div>
                </GlassCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
                <GlassCard>
                    <h3 style={{ color: 'var(--accent-success)', marginBottom: '1rem' }}>{t.registerIncome}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <NeonInput placeholder={t.deliveryPrice} type="number" value={incomePrice} onChange={e => setIncomePrice(e.target.value)} />
                        <NeonInput placeholder={t.commissionProfit} type="number" value={incomeCommission} onChange={e => setIncomeCommission(e.target.value)} />
                        <NeonInput type="date" value={incomeDate} onChange={e => setIncomeDate(e.target.value)} />
                        <NeonButton onClick={handleSaveIncome} variant="success">{t.addIncome}</NeonButton>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 style={{ color: 'var(--accent-danger)', marginBottom: '1rem' }}>{t.registerExpense}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <NeonInput placeholder={t.amount} type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
                        <NeonInput type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.5)',
                                    color: '#fff',
                                    border: '1px solid var(--accent-primary)',
                                    borderRadius: '8px',
                                    padding: '0.5rem'
                                }}
                                value={expenseCategory}
                                onChange={e => setExpenseCategory(e.target.value)}
                            >
                                <option value="">{t.selectCategory}</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            {(expenseCategory && !isAddingCat) && (
                                <NeonButton onClick={handleDeleteCategory} variant="danger" style={{ padding: '0.5rem' }}>x</NeonButton>
                            )}
                            <NeonButton onClick={() => setIsAddingCat(!isAddingCat)} style={{ width: '40px' }}>+</NeonButton>
                        </div>

                        {isAddingCat && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <NeonInput placeholder="New Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                                <NeonButton onClick={handleAddCategory}>Save</NeonButton>
                            </div>
                        )}

                        <NeonButton onClick={handleSaveExpense} variant="danger">{t.addExpense}</NeonButton>
                    </div>
                </GlassCard>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'gray', marginBottom: '1rem' }}>{t.activityLog} ({date.toLocaleString('default', { month: 'long' })})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredLogs.map(log => (
                        <GlassCard key={log.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: log.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)'
                                }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{log.category || (log.type === 'income' ? 'Delivery' : 'Expense')}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'gray' }}>{log.date}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontWeight: 'bold', color: '#fff' }}>€{log.amount.toFixed(2)}</div>
                                <button onClick={() => handleDelete(log.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>🗑️</button>
                            </div>
                        </GlassCard>
                    ))}
                    {filteredLogs.length === 0 && <p style={{ color: 'gray' }}>No activity in this month.</p>}
                </div>
            </div>
        </div>
    );
}
