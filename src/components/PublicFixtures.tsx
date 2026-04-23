import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture } from '../types';
import { CheckCircle, Clock, Flag, Layout } from 'lucide-react';

export default function PublicFixtures() {
  const [teams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const safeTeams = teams || [];
  const safeFixtures = fixtures || [];

  const sets = Array.from(new Set(safeFixtures.map(f => f.set))).sort((a, b) => Number(a) - Number(b));

  const getChip = (result: string) => {
    if (result === '1-0') return { label: '2—0', bg: 'rgba(35, 134, 54, 0.1)', border: 'rgba(35, 134, 54, 0.3)', color: '#3fb950' };
    if (result === '0-1') return { label: '0—2', bg: 'rgba(35, 134, 54, 0.1)', border: 'rgba(35, 134, 54, 0.3)', color: '#3fb950' };
    if (result === '1/2-1/2') return { label: '1—1', bg: 'rgba(210, 153, 34, 0.1)', border: 'rgba(210, 153, 34, 0.3)', color: '#d29922' };
    return { label: 'TBD', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' };
  };

  if (safeFixtures.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Layout size={48} style={{ marginBottom: '20px', opacity: 0.1 }} />
        <p style={{ fontSize: '1.1rem' }}>Fixtures pending deployment.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {sets.map(set => {
        const setFixtures = safeFixtures.filter(f => f.set === set);

        return (
          <div key={String(set)} style={{ marginBottom: '64px' }}>
            {/* Set Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '6px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 15px var(--primary-glow)' }}>
                SET {set}
              </div>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--border-color), transparent)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 500px), 1fr))', gap: '24px' }}>
              {setFixtures.map(fixture => {
                const teamA = safeTeams.find(t => t.id === fixture.teamAId);
                const teamB = safeTeams.find(t => t.id === fixture.teamBId);
                if (!teamA || !teamB) return null;

                const boards = fixture.boardResults || [];
                const done = boards.filter(b => b.result !== '*').length;

                let aScore = 0, bScore = 0;
                boards.forEach(b => {
                  const p1IsA = teamA.players.some(p => p.name === b.player1);
                  if (b.result === '1/2-1/2') { aScore += 0.5; bScore += 0.5; }
                  else if (b.result === '1-0') { p1IsA ? (aScore += 1) : (bScore += 1); }
                  else if (b.result === '0-1') { p1IsA ? (bScore += 1) : (aScore += 1); }
                });

                return (
                  <div key={fixture.id} className="glass-panel" style={{ padding: '0' }}>
                    {/* Fixture Top Bar */}
                    <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Flag size={14} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{fixture.date || 'DATE TBD'}</span>
                      </div>
                      <div className="status-badge" style={{
                        background: fixture.status === 'completed' ? 'rgba(35, 134, 54, 0.1)' : 'rgba(210, 153, 34, 0.1)',
                        color: fixture.status === 'completed' ? '#3fb950' : '#d29922',
                        fontSize: '0.7rem'
                      }}>
                        {fixture.status === 'completed' ? 'FINAL' : 'LIVE'}
                      </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                      {/* Score Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '16px' }}>
                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', color: aScore > bScore ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{teamA.name}</div>
                        <div style={{ background: 'var(--bg-darker)', padding: '6px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '2px' }}>
                          {aScore % 1 === 0 ? aScore : aScore.toFixed(1)} : {bScore % 1 === 0 ? bScore : bScore.toFixed(1)}
                        </div>
                        <div style={{ flex: 1, textAlign: 'left', fontWeight: 700, fontSize: '1.2rem', color: bScore > aScore ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{teamB.name}</div>
                      </div>

                      {/* Board Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {boards.map((board, idx) => {
                          const chip = getChip(board.result);
                          const p1IsWinning = board.result === '1-0';
                          const p2IsWinning = board.result === '0-1';
                          
                          return (
                            <div key={board.gameId || idx} style={{ 
                              background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)',
                              display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>B{idx+1}</span>
                              <div style={{ flex: 1, textAlign: 'right', fontSize: '0.85rem', color: p2IsWinning ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: p1IsWinning ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{board.player1 || '—'}</div>
                              <div style={{ padding: '2px 6px', background: chip.bg, borderRadius: '4px', border: `1px solid ${chip.border}`, color: chip.color, fontSize: '0.7rem', fontWeight: 800, minWidth: '36px', textAlign: 'center' }}>{chip.label}</div>
                              <div style={{ flex: 1, textAlign: 'left', fontSize: '0.85rem', color: p1IsWinning ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: p2IsWinning ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{board.player2 || '—'}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
