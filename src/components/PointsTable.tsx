import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture } from '../types';
import { Trophy } from 'lucide-react';

interface TeamStats {
  teamId: string;
  teamName: string;
  played: number;   // individual board games played
  wins: number;
  draws: number;
  losses: number;
  pts: number;      // W×2 + D×1
}

export default function PointsTable() {
  const [teams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  const safeTeams = teams || [];
  const safeFixtures = fixtures || [];

  const calculateStandings = (): TeamStats[] => {
    const statsMap: Record<string, TeamStats> = {};

    safeTeams.forEach(t => {
      statsMap[t.id] = { teamId: t.id, teamName: t.name, played: 0, wins: 0, draws: 0, losses: 0, pts: 0 };
    });

    safeFixtures.forEach(fixture => {
      const teamA = safeTeams.find(t => t.id === fixture.teamAId);
      const teamB = safeTeams.find(t => t.id === fixture.teamBId);
      if (!teamA || !teamB) return;

      (fixture.boardResults || []).forEach(board => {
        if (board.result === '*') return; // skip pending

        const sA = statsMap[fixture.teamAId];
        const sB = statsMap[fixture.teamBId];
        if (!sA || !sB) return;

        // Determine which team player1 belongs to
        const p1IsTeamA = teamA.players.some(p => p.name === board.player1);

        // Count this as a played board for both teams
        sA.played += 1;
        sB.played += 1;

        if (board.result === '1/2-1/2') {
          sA.draws += 1;
          sB.draws += 1;
          sA.pts += 1;
          sB.pts += 1;
        } else if (board.result === '1-0') {
          // player1 wins
          if (p1IsTeamA) {
            sA.wins += 1; sA.pts += 2;
            sB.losses += 1;
          } else {
            sB.wins += 1; sB.pts += 2;
            sA.losses += 1;
          }
        } else if (board.result === '0-1') {
          // player2 wins
          if (p1IsTeamA) {
            sB.wins += 1; sB.pts += 2;
            sA.losses += 1;
          } else {
            sA.wins += 1; sA.pts += 2;
            sB.losses += 1;
          }
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
    <div>
      <div className="glass-panel" style={{ padding: 'clamp(1rem, 5vw, 2rem)' }}>
        <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={28} color="var(--warning)" /> Live Points Table
        </h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Points: Win = 2 &nbsp;·&nbsp; Draw = 1 &nbsp;·&nbsp; Loss = 0
        </p>

        {safeTeams.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No teams set up yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th>Team</th>
                  <th title="Board games played">P</th>
                  <th title="Wins">W</th>
                  <th title="Draws">D</th>
                  <th title="Losses">L</th>
                  <th title="Total Points (W×2 + D×1)">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((stat, index) => (
                  <tr key={stat.teamId} style={index === 0 && stat.pts > 0 ? { background: 'rgba(245,158,11,0.05)' } : {}}>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      {index === 0 && stat.pts > 0
                        ? <span style={{ color: 'var(--warning)' }}>👑</span>
                        : <span style={{ color: 'var(--text-secondary)' }}>{index + 1}</span>
                      }
                    </td>
                    <td style={{ fontWeight: 600 }}>{stat.teamName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{stat.played}</td>
                    <td style={{ color: 'var(--success)' }}>{stat.wins}</td>
                    <td style={{ color: 'var(--warning)' }}>{stat.draws}</td>
                    <td style={{ color: 'var(--danger)' }}>{stat.losses}</td>
                    <td style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>{stat.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
