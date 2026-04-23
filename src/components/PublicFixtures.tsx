import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture } from '../types';
import { CheckCircle, Clock } from 'lucide-react';

export default function PublicFixtures() {
  const [teams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const safeTeams = teams || [];
  const safeFixtures = fixtures || [];

  const sets = Array.from(new Set(safeFixtures.map(f => f.set))).sort((a, b) => Number(a) - Number(b));

  const getChip = (result: string) => {
    if (result === '1-0') return { label: '2—0', bg: 'rgba(16,185,129,0.15)', border: '#10b981', color: '#10b981' };
    if (result === '0-1') return { label: '0—2', bg: 'rgba(16,185,129,0.15)', border: '#10b981', color: '#10b981' };
    if (result === '1/2-1/2') return { label: '1—1', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', color: '#f59e0b' };
    return { label: 'TBD', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' };
  };

  if (safeFixtures.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No fixtures scheduled yet.
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
        Points system: <strong style={{ color: 'var(--success)' }}>Win = 2</strong> &nbsp;·&nbsp; <strong style={{ color: 'var(--warning)' }}>Draw = 1</strong> &nbsp;·&nbsp; <strong style={{ color: 'var(--danger)' }}>Loss = 0</strong>
      </p>

      {sets.map(set => {
        const setFixtures = safeFixtures.filter(f => f.set === set);

        return (
          <div key={String(set)} style={{ marginBottom: '40px' }}>
            {/* Set header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', borderRadius: '8px', padding: '4px 14px', fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>
                Set {set}
              </div>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--border-color), transparent)' }} />
            </div>

            {setFixtures.map(fixture => {
              const teamA = safeTeams.find(t => t.id === fixture.teamAId);
              const teamB = safeTeams.find(t => t.id === fixture.teamBId);
              if (!teamA || !teamB) return null;

              const boards = fixture.boardResults || [];
              const done = boards.filter(b => b.result !== '*').length;

              // Calculate quick score for this fixture
              let aScore = 0, bScore = 0;
              boards.forEach(b => {
                const p1IsA = teamA.players.some(p => p.name === b.player1);
                if (b.result === '1/2-1/2') { aScore += 0.5; bScore += 0.5; }
                else if (b.result === '1-0') { p1IsA ? (aScore += 1) : (bScore += 1); }
                else if (b.result === '0-1') { p1IsA ? (bScore += 1) : (aScore += 1); }
              });

              return (
                <div key={fixture.id} className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '16px' }}>
                  {/* Fixture matchup bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teamA.name}</span>
                      <div style={{ flexShrink: 0, padding: '4px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', border: '1px solid var(--border-color)' }}>
                        {done > 0 ? `${aScore % 1 === 0 ? aScore : aScore.toFixed(1)} – ${bScore % 1 === 0 ? bScore : bScore.toFixed(1)}` : 'vs'}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teamB.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {fixture.date && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{fixture.date}</span>}
                      {fixture.status === 'completed'
                        ? <span className="status-badge status-completed" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={11}/> Done</span>
                        : done > 0
                          ? <span className="status-badge status-pending" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11}/> {done}/{boards.length} played</span>
                          : <span className="status-badge status-pending" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11}/> Upcoming</span>
                      }
                    </div>
                  </div>

                  {/* Individual board cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '8px' }}>
                    {boards.map((board, idx) => {
                      const chip = getChip(board.result);
                      const p1Wins = board.result === '1-0';
                      const p2Wins = board.result === '0-1';
                      const isDraw = board.result === '1/2-1/2';
                      return (
                        <div key={board.gameId || idx} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '10px 12px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.035)',
                          border: `1px solid ${board.result !== '*' ? chip.border + '44' : 'rgba(255,255,255,0.06)'}`,
                        }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, minWidth: '22px' }}>B{idx+1}</span>
                          <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: p1Wins || isDraw ? 600 : 400, color: p2Wins ? 'var(--text-secondary)' : 'var(--text-primary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {board.player1 || 'TBA'}{p1Wins ? ' ★' : ''}
                          </span>
                          <div style={{ flexShrink: 0, padding: '3px 8px', borderRadius: '6px', background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color, fontWeight: 700, fontSize: '0.78rem', minWidth: '42px', textAlign: 'center' }}>
                            {chip.label}
                          </div>
                          <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: p2Wins || isDraw ? 600 : 400, color: p1Wins ? 'var(--text-secondary)' : 'var(--text-primary)', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p2Wins ? '★ ' : ''}{board.player2 || 'TBA'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
