import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team } from '../types';
import { Crown, ShieldAlert, Loader2 } from 'lucide-react';

export default function Lineups() {
  const [teams, , loading] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const safeTeams = teams || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '12px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Hydrating Lineups...</p>
      </div>
    );
  }

  if (safeTeams.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <ShieldAlert size={48} style={{ marginBottom: '16px', opacity: 0.1 }} />
        <p>No team lineups found.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {safeTeams.map(team => (
          <div key={team.id} className="glass-panel" style={{ padding: '0', height: 'fit-content' }}>
            <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '6px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{team.name.toUpperCase()}</h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {team.players.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No registered players.</p>
                ) : (
                  team.players.map(player => {
                    const isCaptain = team.captain === player.id;
                    return (
                      <div key={player.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: isCaptain ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255,255,255,0.02)',
                        padding: '10px 14px', borderRadius: '10px',
                        border: isCaptain ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent'
                      }}>
                        <span style={{ 
                          fontWeight: isCaptain ? 700 : 500, 
                          color: isCaptain ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.875rem'
                        }}>
                          {player.name}
                        </span>
                        {isCaptain && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--warning)', color: 'black', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>
                            <Crown size={10} /> C
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ROSTER</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: 800 }}>{team.players.length} PLAYERS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
