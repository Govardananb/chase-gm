import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture } from '../types';
import { CheckCircle, Clock2, Swords, History } from 'lucide-react';

export default function Results() {
  const [teams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const safeTeams = teams || [];
  const safeFixtures = fixtures || [];

  const completedFixtures = safeFixtures
    .filter(f => f.status === 'completed' || (f.boardResults || []).some(b => b.result !== '*'))
    .sort((a, b) => Number(a.set) - Number(b.set));

  const getResultChip = (result: string) => {
    if (result === '1-0') return { text: '2–0', bg: 'rgba(35, 134, 54, 0.1)', color: '#3fb950', border: 'rgba(35, 134, 54, 0.3)' };
    if (result === '0-1') return { text: '0–2', bg: 'rgba(35, 134, 54, 0.1)', color: '#3fb950', border: 'rgba(35, 134, 54, 0.3)' };
    if (result === '1/2-1/2') return { text: '1–1', bg: 'rgba(210, 153, 34, 0.1)', color: '#d29922', border: 'rgba(210, 153, 34, 0.3)' };
    return { text: 'TBD', bg: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: 'var(--border-color)' };
  };

  const renderFixtureBoards = (fixture: Fixture) => {
    const teamA = safeTeams.find(t => t.id === fixture.teamAId);
    const teamB = safeTeams.find(t => t.id === fixture.teamBId);
    if (!teamA || !teamB) return null;

    const boards = fixture.boardResults || [];

    return (
      <div key={fixture.id} className="glass-panel" style={{ padding: '0', marginBottom: '32px' }}>
        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>SET {fixture.set}</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{teamA.name} <span style={{ opacity: 0.3, margin: '0 8px' }}>vs</span> {teamB.name}</span>
          </div>
          <div className="status-badge" style={{
            background: fixture.status === 'completed' ? 'rgba(35, 134, 54, 0.1)' : 'rgba(210, 153, 34, 0.1)',
            color: fixture.status === 'completed' ? '#3fb950' : '#d29922',
            fontSize: '0.7rem'
          }}>
            {fixture.status === 'completed' ? 'SET FINAL' : 'ONGOING'}
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {boards.map((board, idx) => {
              const chip = getResultChip(board.result);
              const p1Wins = board.result === '1-0';
              const p2Wins = board.result === '0-1';
              return (
                <div key={board.gameId || idx} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${board.result !== '*' ? chip.border : 'var(--border-color)'}`,
                  borderRadius: '12px', padding: '14px',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 }}>B{idx+1}</span>
                  <span style={{ flex: 1, textAlign: 'right', fontSize: '0.85rem', fontWeight: p1Wins ? 700 : 400, color: p1Wins ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {board.player1 || '—'}
                  </span>
                  <div style={{ flexShrink: 0, padding: '4px 10px', borderRadius: '6px', background: chip.bg, color: chip.color, fontWeight: 800, fontSize: '0.8rem', minWidth: '46px', textAlign: 'center', border: `1px solid ${chip.border}` }}>
                    {chip.text}
                  </div>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: '0.85rem', fontWeight: p2Wins ? 700 : 400, color: p2Wins ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {board.player2 || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {completedFixtures.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <History size={48} style={{ marginBottom: '20px', opacity: 0.1 }} />
          <p style={{ fontSize: '1.1rem' }}>No historical match data available.</p>
        </div>
      ) : (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <History size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Archive & Match History</h3>
          </div>
          {completedFixtures.map(renderFixtureBoards)}
        </section>
      )}
    </div>
  );
}
