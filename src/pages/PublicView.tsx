import { useState } from 'react';
import { Trophy, CalendarDays, Swords } from 'lucide-react';
import PointsTable from '../components/PointsTable';
import PublicFixtures from '../components/PublicFixtures';
import Results from '../components/Results';

type Tab = 'points' | 'fixtures' | 'results';

export default function PublicView() {
  const [activeTab, setActiveTab] = useState<Tab>('points');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'points', label: 'Standings', icon: <Trophy size={16} /> },
    { id: 'fixtures', label: 'Fixtures', icon: <CalendarDays size={16} /> },
    { id: 'results', label: 'Results', icon: <Swords size={16} /> },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem)' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', margin: 0, lineHeight: 1.2 }}>
              <span style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', padding: '10px', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
                <Trophy size={24} color="white" />
              </span>
              Chase GM
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
              Chess League — Live Standings & Results
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <nav style={{ display: 'flex', gap: '6px', background: 'rgba(15,23,42,0.7)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: 'clamp(6px, 2vw, 10px) clamp(10px, 3vw, 18px)',
                borderRadius: '10px', fontWeight: 500, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(59,130,246,0.35)' : 'none',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main key={activeTab} className="animate-fade-in">
        {activeTab === 'points'   && <PointsTable />}
        {activeTab === 'fixtures' && <PublicFixtures />}
        {activeTab === 'results'  && <Results />}
      </main>

      <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        Chase GM · Chess League Manager
      </footer>
    </div>
  );
}
