import { useState } from 'react';
import { Trophy, Users, CalendarDays, Lock, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import TeamSetup from '../components/TeamSetup';
import FixtureManager from '../components/FixtureManager';
import PointsTable from '../components/PointsTable';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { seededTeams, seededFixtures } from '../seedData';
import type { Team, Fixture } from '../types';

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<'teams' | 'fixtures' | 'points'>('points');
  const [, setTeams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [, setFixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const handleManualSeed = () => {
    if (confirm("This will add sample teams and fixtures to your database. Continue?")) {
      setTeams(seededTeams);
      setFixtures(seededFixtures);
      alert("Sample data seeded successfully!");
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.5rem', margin: 0 }}>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--danger), #f43f5e)', 
              padding: '12px', 
              borderRadius: '16px',
              display: 'flex',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
            }}>
              <Lock size={32} color="white" />
            </span>
            <span style={{ letterSpacing: '-0.04em' }}>ADMIN <span style={{ color: 'var(--danger)' }}>PANEL</span></span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>System Management & Data Orchestration</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleManualSeed}
            className="btn" 
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', gap: '8px' }}
          >
            <Database size={16} /> Seed Data
          </button>
          
          <Link to="/" className="btn btn-primary" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            Public Site
          </Link>
        </div>
      </header>

      <div style={{ marginBottom: '32px' }}>
        <nav className="nav-tabs tab-scroll">
          <button 
            onClick={() => setActiveTab('points')}
            className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none' }}
          >
            <Trophy size={18} /> Points Table
          </button>
          <button 
            onClick={() => setActiveTab('fixtures')}
            className={`tab-btn ${activeTab === 'fixtures' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none' }}
          >
            <CalendarDays size={18} /> Fixture Manager
          </button>
          <button 
            onClick={() => setActiveTab('teams')}
            className={`tab-btn ${activeTab === 'teams' ? 'active-tab' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none' }}
          >
            <Users size={18} /> Team Setup
          </button>
        </nav>
      </div>

      <main className="animate-fade-in" key={activeTab}>
        {activeTab === 'teams' && <TeamSetup />}
        {activeTab === 'fixtures' && <FixtureManager />}
        {activeTab === 'points' && <PointsTable />}
      </main>
    </div>
  );
}
