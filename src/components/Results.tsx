import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture } from '../types';
import { CheckCircle, Clock2, Swords } from 'lucide-react';

export default function Results() {
  const [teams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const safeTeams = teams || [];
  const safeFixtures = fixtures || [];

  const completedFixtures = safeFixtures
    .filter(f => f.status === 'completed' || (f.boardResults || []).some(b => b.result !== '*'))
    .sort((a, b) => Number(a.set) - Number(b.set));

  const pendingFixtures = safeFixtures
    .filter(f => f.status !== 'completed' && (f.boardResults || []).every(b => b.result === '*'))
    .sort((a, b) => Number(a.set) - Number(b.set));

  const getResultChip = (result: string) => {
    if (result === '1-0') return { text: '2–0', bg: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: 'var(--success)' };
    if (result === '0-1') return { text: '0–2', bg: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: 'var(--success)' };
    if (result === '1/2-1/2') return { text: '1–1', bg: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: 'var(--warning)' };
    return { text: 'TBD', bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'var(--border-color)' };
  };

  const renderFixtureBoards = (fixture: Fixture) => {
    const teamA = safeTeams.find(t => t.id === fixture.teamAId);
    const teamB = safeTeams.find(t => t.id === fixture.teamBId);
    if (!teamA || !teamB) return null;

    const boards = fixture.boardResults || [];
    const completed = boards.filter(b => b.result !== '*').length;
    const total = boards.length;

    return (
      <div key={fixture.id} className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '20px' }}>
        {/* Fixture header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.2)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
              Set {fixture.set}
            </span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{teamA.name}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>vs</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{teamB.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{completed}/{total} played</span>
            {fixture.status === 'completed'
              ? <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Done</span>
              : <span style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock2 size={12}/> In Progress</span>
            }
          </div>
        </div>

        {/* Board results grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
          {boards.map((board, idx) => {
            const chip = getResultChip(board.result);
            const p1Wins = board.result === '1-0';
            const p2Wins = board.result === '0-1';
            return (
              <div key={board.gameId || idx} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${board.result !== '*' ? chip.border + '55' : 'var(--border-color)'}`,
                borderRadius: '10px', padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', minWidth: '20px' }}>B{idx+1}</span>
                <span style={{ flex: 1, textAlign: 'right', fontSize: '0.875rem', fontWeight: p1Wins ? 700 : 400, color: p1Wins ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {board.player1 || '—'}
                </span>
                <div style={{ flexShrink: 0, padding: '3px 8px', borderRadius: '6px', background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color, fontWeight: 700, fontSize: '0.8rem', minWidth: '44px', textAlign: 'center' }}>
                  {chip.text}
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontSize: '0.875rem', fontWeight: p2Wins ? 700 : 400, color: p2Wins ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {board.player2 || '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {completedFixtures.length === 0 && pendingFixtures.length === 0 && (
        <div className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Swords size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No matches recorded yet.</p>
        </div>
      )}

      {completedFixtures.length > 0 && (
        <section>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={14} color="var(--success)" /> Completed / In Progress
          </h3>
          {completedFixtures.map(renderFixtureBoards)}
        </section>
      )}

      {pendingFixtures.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock2 size={14} color="var(--warning)" /> Upcoming
          </h3>
          {pendingFixtures.map(renderFixtureBoards)}
        </section>
      )}
    </div>
  );
}
