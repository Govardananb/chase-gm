import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture } from '../types';
import { Trophy, Hash, Users, Swords, Activity, Award } from 'lucide-react';

interface TeamStats {
  teamId: string;
  teamName: string;
  fixturesPlayed: number; 
  played: number;         
  wins: number;
  draws: number;
  losses: number;
  pts: number;            
}

export default function PointsTable() {
  const [teams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const safeTeams = teams || [];
  const safeFixtures = fixtures || [];

  const calculateStandings = (): TeamStats[] => {
    const statsMap: Record<string, TeamStats> = {};

    safeTeams.forEach(t => {
      statsMap[t.id] = { teamId: t.id, teamName: t.name, fixturesPlayed: 0, played: 0, wins: 0, draws: 0, losses: 0, pts: 0 };
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

        sA.played += 1;
        sB.played += 1;

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

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', borderTop: '4px solid var(--primary)' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
              <Trophy size={24} color="white" />
            </div>
            <h2 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', margin: 0 }}>League Standings</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live ranking based on individual board performance. 
            <span style={{ marginLeft: '12px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>
              Win 2pts · Draw 1pt · Loss 0pts
            </span>
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
                  <th style={{ width: '60px', textAlign: 'center' }}><Hash size={14} /></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={14} /> TEAM</div></th>
                  <th className="hide-mobile" style={{ textAlign: 'center' }}><Award size={14} /> MAT</th>
                  <th className="hide-mobile" style={{ textAlign: 'center' }}>GMS</th>
                  <th className="hide-mobile" style={{ textAlign: 'center', color: 'var(--success)' }}>W</th>
                  <th className="hide-mobile" style={{ textAlign: 'center', color: 'var(--warning)' }}>D</th>
                  <th className="hide-mobile" style={{ textAlign: 'center', color: 'var(--danger)' }}>L</th>
                  <th style={{ textAlign: 'center', paddingRight: '24px' }}>POINTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((stat, index) => {
                  const isTop = index === 0 && stat.pts > 0;
                  return (
                    <tr key={stat.teamId} style={{ background: isTop ? 'rgba(79, 70, 229, 0.05)' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>
                        {isTop ? (
                          <span style={{ fontSize: '1.2rem' }}>🥇</span>
                        ) : (
                          <span style={{ color: index < 3 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                            {index + 1}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{stat.teamName}</div>
                      </td>
                      <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{stat.fixturesPlayed}</td>
                      <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{stat.played}</td>
                      <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{stat.wins}</td>
                      <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--warning)', fontWeight: 600 }}>{stat.draws}</td>
                      <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 600 }}>{stat.losses}</td>
                      <td style={{ textAlign: 'center', paddingRight: '24px' }}>
                        <span style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: 800, 
                          color: isTop ? 'var(--primary)' : 'var(--text-primary)',
                          background: isTop ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                          padding: '4px 12px',
                          borderRadius: '8px'
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
