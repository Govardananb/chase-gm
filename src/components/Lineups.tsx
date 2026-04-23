import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team } from '../types';
import { Users, Crown, ShieldAlert } from 'lucide-react';

export default function Lineups() {
  const [teams, , loading] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const safeTeams = teams || [];

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading rosters...</div>;
  }

  if (safeTeams.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <ShieldAlert size={48} style={{ marginBottom: '16px', opacity: 0.1 }} />
        <p>No team lineups available yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '24px' }}>
        {safeTeams.map(team => (
          <div key={team.id} className="glass-panel" style={{ padding: '0', height: 'fit-content' }}>
            <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{team.name.toUpperCase()}</h3>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {team.players.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No registered players.</p>
                ) : (
                  team.players.map(player => {
                    const isCaptain = team.captain === player.id;
                    return (
                      <div key={player.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: isCaptain ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255,255,255,0.02)',
                        padding: '12px 16px', borderRadius: '12px',
                        border: isCaptain ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            fontWeight: isCaptain ? 700 : 500, 
                            color: isCaptain ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontSize: '0.95rem'
                          }}>
                            {player.name}
                          </span>
                        </div>
                        {isCaptain && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--warning)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>
                            <Crown size={10} /> 🛰️ CAPTAIN
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ROSTER DEPTH</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 800 }}>{team.players.length} PLAYERS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
