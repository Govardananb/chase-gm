import { useState } from 'react';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Player } from '../types';
import { Trash2, UserPlus, Shield, Plus } from 'lucide-react';

export default function TeamSetup() {
  const [teams, setTeams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [newTeamName, setNewTeamName] = useState('');
  
  // Player staging state per team ID
  const [newPlayerName, setNewPlayerName] = useState<{ [teamId: string]: string }>({});

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
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
    const pName = newPlayerName[teamId]?.trim();
    
    if (!pName) return;

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: pName,
    };

    setTeams((teams || []).map(team => {
      if (team.id === teamId) {
        // If first player, make them captain by default
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
    if (confirm('Are you sure you want to delete this team?')) {
      setTeams((teams || []).filter(t => t.id !== teamId));
    }
  };

  const handleDeletePlayer = (teamId: string, playerId: string) => {
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
    setTeams((teams || []).map(team => 
      team.id === teamId ? { ...team, captain: playerId } : team
    ));
  };

  return (
    <div>
      <div className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={24} color="var(--primary)" /> Add Franchise Team
        </h2>
        <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Team Name (e.g. Gotham Knights)" 
            className="input-field"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            style={{ flex: '1 1 250px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ flex: '0 0 auto' }}>
            <Plus size={18} /> Create Team
          </button>
        </form>
      </div>

      {(!teams || teams.length === 0) ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No teams created yet. Add one above.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '24px' }}>
          {teams.map(team => (
            <div key={team.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>{team.name}</h3>
                <button onClick={() => handleDeleteTeam(team.id)} className="btn-icon" style={{ color: 'var(--danger)' }} title="Delete Team">
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ flex: 1 }}>
                {team.players.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>No players added yet.</p>
                ) : (
                  <ul style={{ listStyle: 'none', margin: '0 0 20px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {team.players.map(player => (
                      <li key={player.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px',
                        border: team.captain === player.id ? '1px solid var(--primary)' : '1px solid transparent'
                      }}>
                        <div>
                          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {player.name} {team.captain === player.id && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>CAPTAIN</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {team.captain !== player.id && (
                            <button onClick={() => setCaptain(team.id, player.id)} className="btn-icon" title="Make Captain" style={{ padding: '6px' }}>
                              <Shield size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDeletePlayer(team.id, player.id)} className="btn-icon" style={{ padding: '6px', color: 'rgba(239, 68, 68, 0.7)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                <form onSubmit={(e) => handleAddPlayer(team.id, e)} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" placeholder="Player Name" className="input-field" style={{ padding: '8px 12px', fontSize: '0.9rem', flex: 1 }}
                    value={newPlayerName[team.id] || ''} onChange={(e) => setNewPlayerName({...newPlayerName, [team.id]: e.target.value})}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                    <UserPlus size={16} />
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
