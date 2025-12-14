'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { NeonButton } from '@/components/UI';
import CalendarView from '@/components/CalendarView';
import DeliveryTab from '@/components/DeliveryTab';
import BeveragesTab from '@/components/BeveragesTab';
import InvestmentsTab from '@/components/InvestmentsTab';
import SummaryTab from '@/components/SummaryTab';
import StrategyTab from '@/components/StrategyTab';
import { DeliveryLog, BeverageTransaction, InvestmentRecord } from '@/lib/models';
import { translations, Language } from '@/lib/translations';

type Tab = 'dashboard' | 'delivery' | 'beverages' | 'investments' | 'calendar' | 'strategy';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('es'); // Default to Spanish per user implied context, or User preference.

  // Global Date State (Month/Year)
  const [currentDate, setCurrentDate] = useState(new Date());

  // Shared Data
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [beverageTrans, setBeverageTrans] = useState<BeverageTransaction[]>([]);
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);

  const refreshData = async () => {
    const { data: dLogs } = await supabase.from('delivery_logs').select('*').order('date', { ascending: false });
    if (dLogs) setDeliveryLogs(dLogs as DeliveryLog[]);

    const { data: bTrans } = await supabase.from('beverage_transactions').select('*, product:beverage_products(name)').order('date', { ascending: false });
    if (bTrans) setBeverageTrans(bTrans as any);

    const { data: inv } = await supabase.from('investments').select('*').order('date', { ascending: false });
    if (inv) setInvestments(inv);

    const { data: bank } = await supabase.from('bank_records').select('balance').order('date', { ascending: false }).limit(1).single();
    if (bank) setCurrentBalance(bank.balance);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        refreshData();
      }
      setLoading(false);
    });
  }, []);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  if (loading) return <div className="flex-center" style={{ height: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading System...</div>;
  if (!session) return <div className="flex-center" style={{ height: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Redirecting to Secure Access...</div>;

  // Only Red Theme Injection remains below


  // Global Red Theme Injection
  const redTheme = {
    '--accent-primary': '#FF2A2A', // Deligos Red
    '--accent-secondary': '#FF5555',
    '--neon-glow-primary': '0 0 10px rgba(255, 42, 42, 0.5)',
    '--text-highlight': '#FF8888'
  } as React.CSSProperties;

  const t = translations[lang];

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', ...redTheme }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>

        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Deligos Logo" style={{ width: '50px', height: 'auto', maxHeight: '50px' }} />
          <h1 style={{ letterSpacing: '2px', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <span style={{ color: '#FF2A2A', textShadow: '0 0 15px rgba(255,0,0,0.6)' }}>DELIGOS</span> <span style={{ color: '#fff' }}>FINANCE</span>
          </h1>
        </div>

        {/* Global Month Navigator & Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', border: '1px solid #FF2A2A' }}>
            <NeonButton onClick={() => changeMonth(-1)} style={{ padding: '0.2rem 0.8rem' }}>&lt;</NeonButton>
            <span style={{ color: '#fff', fontWeight: 'bold', minWidth: '150px', textAlign: 'center' }}>
              {currentDate.toLocaleString(lang, { month: 'long', year: 'numeric' })}
            </span>
            <NeonButton onClick={() => changeMonth(1)} style={{ padding: '0.2rem 0.8rem' }}>&gt;</NeonButton>
          </div>

          <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <div onClick={() => setLang('es')} style={{ cursor: 'pointer', opacity: lang === 'es' ? 1 : 0.5 }}>🇪🇸</div>
            <div onClick={() => setLang('en')} style={{ cursor: 'pointer', opacity: lang === 'en' ? 1 : 0.5 }}>🇺🇸</div>
            <div onClick={() => setLang('it')} style={{ cursor: 'pointer', opacity: lang === 'it' ? 1 : 0.5 }}>🇮🇹</div>
            <div onClick={() => setLang('de')} style={{ cursor: 'pointer', opacity: lang === 'de' ? 1 : 0.5 }}>🇩🇪</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <nav className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>{t.dashboard}</NavButton>
            <NavButton active={activeTab === 'delivery'} onClick={() => setActiveTab('delivery')}>{t.delivery}</NavButton>
            <NavButton active={activeTab === 'beverages'} onClick={() => setActiveTab('beverages')}>{t.beverages}</NavButton>
            <NavButton active={activeTab === 'investments'} onClick={() => setActiveTab('investments')}>{t.investment}</NavButton>
            <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>{t.calendar}</NavButton>
            <NavButton active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')}>{t.strategy}</NavButton>
          </nav>
          <NeonButton variant="danger" onClick={() => supabase.auth.signOut()} style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>{t.signOut}</NeonButton>
        </div>
      </header>

      <div style={{ minHeight: '60vh' }}>
        {activeTab === 'dashboard' && <SummaryTab date={currentDate} deliveryLogs={deliveryLogs} beverageTrans={beverageTrans} investments={investments} t={t} />}
        {activeTab === 'delivery' && <DeliveryTab userId={session?.user?.id} date={currentDate} logs={deliveryLogs} onUpdate={refreshData} t={t} />}
        {activeTab === 'beverages' && <BeveragesTab userId={session?.user?.id} date={currentDate} transactions={beverageTrans} onUpdate={refreshData} t={t} />}
        {activeTab === 'investments' && <InvestmentsTab userId={session?.user?.id} date={currentDate} currentBalance={currentBalance} logs={investments} deliveryLogs={deliveryLogs} beverageTrans={beverageTrans} onUpdate={refreshData} t={t} />}
        {activeTab === 'calendar' && <CalendarView date={currentDate} deliveryLogs={deliveryLogs} beverageLogs={beverageTrans} onDateChange={setCurrentDate} t={t} />}
        {activeTab === 'strategy' && <StrategyTab deliveryLogs={deliveryLogs} beverageTrans={beverageTrans} investments={investments} t={t} />}
      </div>
    </main>
  );
}

function NavButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(255, 42, 42, 0.1)' : 'transparent',
      border: 'none',
      color: active ? '#FF2A2A' : 'var(--text-muted)',
      padding: '0.6rem 1.2rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s',
      textShadow: active ? '0 0 10px rgba(255,42,42,0.5)' : 'none',
      whiteSpace: 'nowrap'
    }}>
      {children}
    </button>
  )
}
