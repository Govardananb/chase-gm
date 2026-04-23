import { useState } from 'react';
import { Trophy, CalendarDays, Swords, LayoutDashboard } from 'lucide-react';
import PointsTable from '../components/PointsTable';
import PublicFixtures from '../components/PublicFixtures';
import Results from '../components/Results';

type Tab = 'points' | 'fixtures' | 'results';

export default function PublicView() {
  const [activeTab, setActiveTab] = useState<Tab>('points');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'points', label: 'Standings', icon: <Trophy size={18} /> },
    { id: 'fixtures', label: 'Fixtures', icon: <CalendarDays size={18} /> },
    { id: 'results', label: 'Results', icon: <Swords size={18} /> },
  ];

  return (
    <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1rem, 5vw, 3rem)' }}>
      {/* Header Area */}
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'clamp(1.75rem, 6vw, 3rem)', margin: 0 }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', 
                padding: '12px', 
                borderRadius: '16px', 
                display: 'flex',
                boxShadow: '0 8px 30px rgba(79, 70, 229, 0.4)'
              }}>
                <LayoutDashboard size={32} color="white" />
              </span>
              <span style={{ letterSpacing: '-0.04em' }}>CHASE <span style={{ color: 'var(--primary)' }}>GM</span></span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '1rem', fontWeight: 500 }}>
              Official Chess League Management System
            </p>
          </div>
          
          <div className="nav-tabs tab-scroll">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: '1px', background: 'linear-gradient(to right, var(--border-color), transparent)' }} />
      </header>

      {/* Main Content */}
      <main key={activeTab} className="animate-fade-in">
        {activeTab === 'points'   && <PointsTable />}
        {activeTab === 'fixtures' && <PublicFixtures />}
        {activeTab === 'results'  && <Results />}
      </main>

      {/* Footer */}
      <footer style={{ 
        marginTop: '80px', 
        padding: '40px 0', 
        borderTop: '1px solid var(--border-color)', 
        textAlign: 'center', 
        color: 'var(--text-secondary)', 
        fontSize: '0.875rem' 
      }}>
        <div style={{ marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>CHASE GM © 2026</div>
        <p style={{ opacity: 0.5 }}>Professional Tournament Orchestration</p>
      </footer>
    </div>
  );
}
