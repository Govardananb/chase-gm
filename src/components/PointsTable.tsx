import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture } from '../types';
import { Trophy, Hash, Users, Activity, Award } from 'lucide-react';

interface TeamStats {
  teamId: string;
  teamName: string;
  fixturesPlayed: number; 
  wins: number;
  draws: number;
  losses: number;
  pts: number;            
}

export default function PointsTable() {
  const [teams, , loadingTeams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures, , loadingFixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const safeTeams = teams || [];
  const safeFixtures = fixtures || [];

  const calculateStandings = (): TeamStats[] => {
    const statsMap: Record<string, TeamStats> = {};

    safeTeams.forEach(t => {
      statsMap[t.id] = { teamId: t.id, teamName: t.name, fixturesPlayed: 0, wins: 0, draws: 0, losses: 0, pts: 0 };
    });

    safeFixtures.forEach(fixture => {
      const teamA = safeTeams.find(t => t.id === fixture.teamAId);
      const teamB = safeTeams.find(t => t.id === fixture.teamBId);
      if (!teamA || !teamB) return;

      const boards = fixture.boardResults || [];
      const hasPlayedAny = boards.some(b => b.result !== '*');
      
      if (hasPlayedAny) {
        if (statsMap[fixture.teamAId]) statsMap[fixture.teamAId].fixturesPlayed += 1;
        if (statsMap[fixture.teamBId]) statsMap[fixture.teamBId].fixturesPlayed += 1;
      }

      boards.forEach(board => {
        if (board.result === '*') return;

        const sA = statsMap[fixture.teamAId];
        const sB = statsMap[fixture.teamBId];
        if (!sA || !sB) return;

        const p1IsTeamA = teamA.players.some(p => p.name === board.player1);

        if (board.result === '1/2-1/2') {
          sA.draws += 1; sB.draws += 1;
          sA.pts += 1; sB.pts += 1;
        } else if (board.result === '1-0') {
          if (p1IsTeamA) { sA.wins += 1; sA.pts += 2; sB.losses += 1; } 
          else { sB.wins += 1; sB.pts += 2; sA.losses += 1; }
        } else if (board.result === '0-1') {
          if (p1IsTeamA) { sB.wins += 1; sB.pts += 2; sA.losses += 1; } 
          else { sA.wins += 1; sA.pts += 2; sB.losses += 1; }
        }
      });
    });

    return Object.values(statsMap).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      return b.wins - a.wins;
    });
  };

  const standings = calculateStandings();

  if (loadingTeams || loadingFixtures) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Synchronizing standings...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: 'clamp(1rem, 4vw, 2.5rem)', borderTop: '4px solid var(--primary)' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
              <Trophy size={20} color="white" />
            </div>
            <h2 style={{ fontSize: 'clamp(1.15rem, 5vw, 1.5rem)', margin: 0 }}>League Standings</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Live ranking based on individual board performance.
          </p>
        </div>

        {safeTeams.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Activity size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Gathering match data...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><Hash size={12} /></th>
                  <th style={{ minWidth: '130px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={12} /> TEAM</div></th>
                  <th style={{ textAlign: 'center' }} title="Matches (Sets) Played"><Award size={12} /> M</th>
                  <th style={{ textAlign: 'center', color: 'var(--success)' }}>W</th>
                  <th style={{ textAlign: 'center', color: 'var(--warning)' }}>D</th>
                  <th style={{ textAlign: 'center', color: 'var(--danger)' }}>L</th>
                  <th style={{ textAlign: 'center', color: 'var(--primary)', borderLeft: '1px solid var(--border-color)', fontWeight: 800 }}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((stat, index) => {
                  const isTop = index === 0 && stat.pts > 0;
                  return (
                    <tr key={stat.teamId} style={{ background: isTop ? 'rgba(79, 70, 229, 0.05)' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>
                        {isTop ? '🥇' : <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{index + 1}</span>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{stat.teamName}</div>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.fixturesPlayed}</td>
                      <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{stat.wins}</td>
                      <td style={{ textAlign: 'center', color: 'var(--warning)', fontWeight: 600 }}>{stat.draws}</td>
                      <td style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 600 }}>{stat.losses}</td>
                      <td style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)' }}>
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: 800, 
                          color: isTop ? 'var(--primary)' : 'var(--text-primary)',
                        }}>
                          {stat.pts}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
