import { useState } from 'react';
import { Trophy, Users, CalendarDays, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import TeamSetup from '../components/TeamSetup';
import FixtureManager from '../components/FixtureManager';
import PointsTable from '../components/PointsTable';

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<'teams' | 'fixtures' | 'points'>('points');

  return (
    <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2rem', margin: 0 }}>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--danger), #f43f5e)', 
              padding: '12px', 
              borderRadius: '12px',
              display: 'flex'
            }}>
              <Lock size={28} color="white" />
            </span>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Manage Teams and Fixtures</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <nav style={{ 
            display: 'flex', 
            gap: '10px', 
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <button 
              onClick={() => setActiveTab('points')}
              className={`btn ${activeTab === 'points' ? 'active-tab' : ''}`}
              style={activeTab === 'points' ? { backgroundColor: 'var(--danger)', color: 'white' } : { color: 'var(--text-secondary)' }}
            >
              <Trophy size={18} /> Points Table
            </button>
            <button 
              onClick={() => setActiveTab('fixtures')}
              className={`btn ${activeTab === 'fixtures' ? 'active-tab' : ''}`}
              style={activeTab === 'fixtures' ? { backgroundColor: 'var(--danger)', color: 'white' } : { color: 'var(--text-secondary)' }}
            >
              <CalendarDays size={18} /> Edit Fixtures
            </button>
            <button 
              onClick={() => setActiveTab('teams')}
              className={`btn ${activeTab === 'teams' ? 'active-tab' : ''}`}
              style={activeTab === 'teams' ? { backgroundColor: 'var(--danger)', color: 'white' } : { color: 'var(--text-secondary)' }}
            >
              <Users size={18} /> Edit Teams
            </button>
          </nav>
          
          <Link to="/" className="btn" style={{ padding: '8px 16px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            View Public Site
          </Link>
        </div>
      </header>

      <main className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease' }} key={activeTab}>
        {activeTab === 'teams' && <TeamSetup />}
        {activeTab === 'fixtures' && <FixtureManager />}
        {activeTab === 'points' && <PointsTable />}
      </main>
    </div>
  );
}
