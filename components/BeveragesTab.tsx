import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BeverageProduct, BeverageTransaction } from '@/lib/models';
import { GlassCard, NeonButton, NeonInput } from '@/components/UI';

export default function BeveragesTab({ date, transactions, onUpdate, userId, t }: { date: Date, transactions: BeverageTransaction[], onUpdate: () => void, userId: string, t: any }) {
    const [products, setProducts] = useState<BeverageProduct[]>([]);

    // New Product State
    const [newProdName, setNewProdName] = useState('');
    const [newProdBuy, setNewProdBuy] = useState('');
    const [newProdSell, setNewProdSell] = useState('');
    const [newProdStock, setNewProdStock] = useState('0');

    // Transaction State
    const [selectedProd, setSelectedProd] = useState('');
    const [transQuantity, setTransQuantity] = useState('');
    const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data: prods } = await supabase.from('beverage_products').select('*').order('name');
        if (prods) setProducts(prods);
    };

    // Filter by Date
    const filteredTrans = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });
    }, [transactions, date]);

    const handleAddProduct = async () => {
        if (!newProdName || !newProdBuy || !newProdSell || !userId) return;
        const { error } = await supabase.from('beverage_products').insert({
            user_id: userId,
            name: newProdName,
            buy_price: parseFloat(newProdBuy),
            sell_price: parseFloat(newProdSell),
            current_stock: parseInt(newProdStock)
        });
        if (error) alert(error.message);
        else {
            setNewProdName(''); setNewProdBuy(''); setNewProdSell(''); setNewProdStock('0');
            fetchProducts();
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm(t.confirmDelete)) return;
        const { error } = await supabase.from('beverage_products').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchProducts();
    };

    const handleUpdateProduct = async (id: number, field: keyof BeverageProduct, value: string) => {
        const { error } = await supabase.from('beverage_products').update({ [field]: value }).eq('id', id);
        if (error) alert(error.message);
        else fetchProducts();
    };

    const handleTransaction = async (type: 'sale' | 'purchase') => {
        if (!selectedProd || !transQuantity || !userId) return;

        const product = products.find(p => p.id.toString() === selectedProd);
        if (!product) return;

        const qty = parseInt(transQuantity);
        const amount = type === 'sale' ? (qty * product.sell_price) : (qty * product.buy_price);

        if (type === 'sale' && product.current_stock < qty) {
            alert(t.insufficientStock);
            return;
        }

        const { error: transError } = await supabase.from('beverage_transactions').insert({
            user_id: userId,
            product_id: product.id,
            type,
            quantity: qty,
            total_amount: amount,
            date: transDate
        });

        if (transError) {
            alert(transError.message);
            return;
        }

        const newStock = type === 'sale' ? product.current_stock - qty : product.current_stock + qty;
        await supabase.from('beverage_products').update({ current_stock: newStock }).eq('id', product.id);

        setTransQuantity('');
        onUpdate();
        fetchProducts();
    };

    const handleDeleteTransaction = async (id: number) => {
        if (!confirm(t.confirmDelete)) return;
        const { error } = await supabase.from('beverage_transactions').delete().eq('id', id);
        if (error) alert(error.message);
        else onUpdate();
    }

    // Stats
    const totalStockVal = products.reduce((acc, p) => acc + (p.current_stock * p.buy_price), 0);
    const totalPotentialSales = products.reduce((acc, p) => acc + (p.current_stock * p.sell_price), 0);

    // Monthly Stats
    const mIncome = filteredTrans.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.total_amount, 0);
    const mExpenses = filteredTrans.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.total_amount, 0);

    return (
        <div className="fade-in">
            <h2 className="neon-text" style={{ marginBottom: '1rem' }}>{t.beverages}</h2>

            {/* Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.inventoryValue}</div>
                    <div style={{ fontSize: '1.5rem', color: '#fff' }}>€{totalStockVal.toFixed(2)}</div>
                </GlassCard>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.projectedRevenue}</div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>€{totalPotentialSales.toFixed(2)}</div>
                </GlassCard>
                <GlassCard>
                    <div style={{ color: 'gray', fontSize: '0.9rem' }}>{t.monthlyIncome} ({date.toLocaleString('default', { month: 'short' })})</div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--accent-success)' }}>€{mIncome.toFixed(2)}</div>
                </GlassCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {/* Transaction Panel */}
                <GlassCard>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }}>{t.newTransaction}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <select
                            style={{ padding: '0.8rem', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
                            value={selectedProd}
                            onChange={e => setSelectedProd(e.target.value)}
                        >
                            <option value="">{t.selectProduct}</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
                            ))}
                        </select>
                        <NeonInput placeholder={t.quantity} type="number" value={transQuantity} onChange={e => setTransQuantity(e.target.value)} />
                        <NeonInput type="date" value={transDate} onChange={e => setTransDate(e.target.value)} />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <NeonButton onClick={() => handleTransaction('sale')} variant="success" style={{ flex: 1 }}>{t.sell}</NeonButton>
                            <NeonButton onClick={() => handleTransaction('purchase')} variant="danger" style={{ flex: 1 }}>{t.buyRestock}</NeonButton>
                        </div>
                    </div>
                </GlassCard>

                {/* Add Product Panel */}
                <GlassCard>
                    <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{t.addNewProduct}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <NeonInput placeholder={t.name} value={newProdName} onChange={e => setNewProdName(e.target.value)} style={{ gridColumn: 'span 2' }} />
                        <NeonInput placeholder={t.buyPrice} type="number" value={newProdBuy} onChange={e => setNewProdBuy(e.target.value)} />
                        <NeonInput placeholder={t.sellPrice} type="number" value={newProdSell} onChange={e => setNewProdSell(e.target.value)} />
                        <NeonInput placeholder={t.initialStock} type="number" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} style={{ gridColumn: 'span 2' }} />
                        <NeonButton onClick={handleAddProduct} style={{ gridColumn: 'span 2' }}>{t.createProduct}</NeonButton>
                    </div>
                </GlassCard>
            </div>

            {/* Inventory Table */}
            <GlassCard>
                <h3 style={{ marginBottom: '1rem' }}>{t.inventoryManager}</h3>
                <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Product</th>
                                <th style={{ padding: '1rem' }}>Buy (€)</th>
                                <th style={{ padding: '1rem' }}>Sell (€)</th>
                                <th style={{ padding: '1rem' }}>Stock</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '0.8rem' }}>{p.name}</td>
                                    <td><input type="number" defaultValue={p.buy_price} onBlur={e => handleUpdateProduct(p.id, 'buy_price', e.target.value)} style={{ background: 'transparent', border: 'none', color: '#aaa', width: '60px' }} /></td>
                                    <td><input type="number" defaultValue={p.sell_price} onBlur={e => handleUpdateProduct(p.id, 'sell_price', e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', width: '60px', fontWeight: 'bold' }} /></td>
                                    <td>{p.current_stock}</td>
                                    <td><button onClick={() => handleDeleteProduct(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>x</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 style={{ marginBottom: '1rem' }}>Recent History ({date.toLocaleString('default', { month: 'long' })})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredTrans.map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                            <div>
                                <span style={{ color: t.type === 'sale' ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 'bold', marginRight: '1rem' }}>{t.type.toUpperCase()}</span>
                                {(t.product as any)?.name} (x{t.quantity})
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span>€{t.total_amount.toFixed(2)}</span>
                                <button onClick={() => handleDeleteTransaction(t.id)} style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                    {filteredTrans.length === 0 && <p style={{ color: 'gray' }}>No transactions this month.</p>}
                </div>
            </GlassCard>
        </div>
    );
}
