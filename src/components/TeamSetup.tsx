import { useState } from 'react';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Player } from '../types';
import { Trash2, UserPlus, Users, Crown, ShieldPlus, PlusCircle, Loader2 } from 'lucide-react';

export default function TeamSetup() {
  const [teams, setTeams, loading] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState<{ [teamId: string]: string }>({});

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!newTeamName.trim()) return;
    
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: newTeamName.trim(),
      captain: '',
      players: []
    };
    
    setTeams([...(teams || []), newTeam]);
    setNewTeamName('');
  };

  const handleAddPlayer = (teamId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const pName = newPlayerName[teamId]?.trim();
    if (!pName) return;

    const newPlayer: Player = { id: crypto.randomUUID(), name: pName };

    setTeams((teams || []).map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          players: [...team.players, newPlayer],
          captain: team.captain || newPlayer.id
        };
      }
      return team;
    }));
    setNewPlayerName({ ...newPlayerName, [teamId]: '' });
  };

  const handleDeleteTeam = (teamId: string) => {
    if (loading) return;
    if (confirm('Delete this team?')) {
      setTeams((teams || []).filter(t => t.id !== teamId));
    }
  };

  const handleDeletePlayer = (teamId: string, playerId: string) => {
    if (loading) return;
    setTeams((teams || []).map(team => {
      if (team.id === teamId) {
        const updatedPlayers = team.players.filter(p => p.id !== playerId);
        return {
          ...team,
          players: updatedPlayers,
          captain: team.captain === playerId ? (updatedPlayers[0]?.id || '') : team.captain
        };
      }
      return team;
    }));
  };

  const setCaptain = (teamId: string, playerId: string) => {
    if (loading) return;
    setTeams((teams || []).map(team => 
      team.id === teamId ? { ...team, captain: playerId } : team
    ));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" color="var(--primary)" />
        <p style={{ color: 'var(--text-secondary)' }}>Hydrating Roster...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: 'clamp(1rem, 4vw, 2rem)', marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={24} color="var(--primary)" /> Manage Franchise Teams
        </h2>
        <form onSubmit={handleCreateTeam} className="admin-grid" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Franchise Name (e.g. London Lions)" 
            className="input-field"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px' }}>
            <PlusCircle size={18} /> Create Team
          </button>
        </form>
      </div>

      {(!teams || teams.length === 0) ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No teams registered.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '24px' }}>
          {teams.map(team => (
            <div key={team.id} className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{team.name.toUpperCase()}</h3>
                <button onClick={() => handleDeleteTeam(team.id)} className="btn-icon" style={{ color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ padding: '24px', flex: 1 }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>ROSTER ({team.players.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {team.players.map(player => (
                    <div key={player.id} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '10px',
                      border: team.captain === player.id ? '1px solid var(--primary)' : '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span style={{ fontWeight: team.captain === player.id ? 700 : 500, color: team.captain === player.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{player.name}</span>
                         {team.captain === player.id && <Crown size={14} color="var(--warning)" />}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {team.captain !== player.id && (
                          <button onClick={() => setCaptain(team.id, player.id)} className="btn-icon" title="Assign Captain" style={{ padding: '6px' }}>
                            <ShieldPlus size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDeletePlayer(team.id, player.id)} className="btn-icon" style={{ padding: '6px', color: 'rgba(218, 54, 51, 0.6)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {team.players.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No players added.</p>}
                </div>
              </div>

              <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                <form onSubmit={(e) => handleAddPlayer(team.id, e)} style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" placeholder="Full name" className="input-field" style={{ padding: '10px 14px', fontSize: '0.875rem', flex: 1 }}
                    value={newPlayerName[team.id] || ''} onChange={(e) => setNewPlayerName({...newPlayerName, [team.id]: e.target.value})}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                    <UserPlus size={18} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
