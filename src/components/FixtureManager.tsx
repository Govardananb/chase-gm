import { useState } from 'react';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture, BoardResult } from '../types';
import { Calendar, CheckCircle, Clock, Plus, Trash2, Swords, ChevronDown, User } from 'lucide-react';

export default function FixtureManager() {
  const [teams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [fixtures, setFixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);
  
  const [setNum, setSetNum] = useState('1');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [date, setDate] = useState('');

  const handleCreateFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAId || !teamBId || teamAId === teamBId) {
      alert("Please select two different teams.");
      return;
    }

    const newFixture: Fixture = {
      id: crypto.randomUUID(),
      set: setNum,
      teamAId,
      teamBId,
      date,
      status: 'pending',
      boardResults: []
    };
    
    setFixtures([...(fixtures || []), newFixture]);
    setTeamAId('');
    setTeamBId('');
  };

  const handleDeleteFixture = (id: string) => {
    if (confirm("Delete this fixture?")) {
      setFixtures((fixtures || []).filter(f => f.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setFixtures((fixtures || []).map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === 'completed' ? 'pending' : 'completed' };
      }
      return f;
    }));
  };

  const addManualBoard = (fixtureId: string) => {
    const newBoard: BoardResult = {
      gameId: crypto.randomUUID(),
      player1: '',
      player2: '',
      result: '*'
    };
    setFixtures((fixtures || []).map(f => {
      if (f.id === fixtureId) {
        return { ...f, boardResults: [...(f.boardResults || []), newBoard] };
      }
      return f;
    }));
  };

  const deleteBoard = (fixtureId: string, gameId: string) => {
    setFixtures((fixtures || []).map(f => {
      if (f.id === fixtureId) {
        const updatedBoards = f.boardResults?.filter(b => b.gameId !== gameId) || [];
        return updateFixtureScores(f, updatedBoards);
      }
      return f;
    }));
  };

  const updateBoard = (fixture: Fixture, gameId: string, field: keyof BoardResult, value: string) => {
    const updatedBoards = fixture.boardResults?.map(b => b.gameId === gameId ? { ...b, [field]: value } : b) || [];
    setFixtures((fixtures || []).map(f => {
      if (f.id === fixture.id) {
        return updateFixtureScores(f, updatedBoards);
      }
      return f;
    }));
  };

  const updateFixtureScores = (fixture: Fixture, boards: BoardResult[]): Fixture => {
    let teamAScore = 0;
    let teamBScore = 0;

    const teamA = (teams || []).find(t => t.id === fixture.teamAId);

    if (teamA) {
      boards.forEach(b => {
        if (b.result === '*') return;
        const player1IsTeamA = teamA.players.some(p => p.name === b.player1);

        if (b.result === '1-0') {
          if (player1IsTeamA) teamAScore += 1; else teamBScore += 1;
        } else if (b.result === '0-1') {
          if (!player1IsTeamA) teamAScore += 1; else teamBScore += 1;
        } else if (b.result === '1/2-1/2') {
          teamAScore += 0.5;
          teamBScore += 0.5;
        }
      });
    }

    return { ...fixture, boardResults: boards, teamAScore, teamBScore };
  };

  return (
    <div className="animate-fade-in">
      {/* Create Section */}
      <div className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 2rem)', marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={24} color="var(--primary)" /> Schedule Match
        </h2>
        <form onSubmit={handleCreateFixture} className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>SET</label>
            <input 
              type="number" min="1" className="input-field"
              value={setNum} onChange={(e) => setSetNum(e.target.value)} required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>TEAM A</label>
            <select className="input-field" value={teamAId} onChange={e => setTeamAId(e.target.value)} required>
              <option value="">Select</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700, paddingBottom: '12px' }}>VS</div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>TEAM B</label>
            <select className="input-field" value={teamBId} onChange={e => setTeamBId(e.target.value)} required>
              <option value="">Select</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>DATE</label>
            <input 
              type="date" className="input-field"
              value={date} onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
            <Plus size={18} /> Schedule
          </button>
        </form>
      </div>

      {/* List Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(!fixtures || fixtures.length === 0) ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No matches scheduled yet.
          </div>
        ) : (
          fixtures.sort((a,b) => Number(a.set) - Number(b.set)).map(fixture => {
            const teamA = (teams || []).find(t => t.id === fixture.teamAId);
            const teamB = (teams || []).find(t => t.id === fixture.teamBId);
            if (!teamA || !teamB) return null;

            const allPlayers = [...teamA.players, ...teamB.players];

            return (
              <div key={fixture.id} className="glass-panel" style={{ padding: '0' }}>
                {/* Fixture Header Bar */}
                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem' }}>SET {fixture.set}</div>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{teamA.name} <span style={{ opacity: 0.3 }}>v</span> {teamB.name}</span>
                    <button onClick={() => toggleStatus(fixture.id)} style={{ padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', color: fixture.status === 'completed' ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)' }}>
                      {fixture.status === 'completed' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                      {fixture.status.toUpperCase()}
                    </button>
                  </div>
                  <button onClick={() => handleDeleteFixture(fixture.id)} style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 700 }} className="btn-icon">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ padding: '24px' }}>
                   {/* Board Results Management */}
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Swords size={16} /> Board Matches
                    </h4>
                    <button onClick={() => addManualBoard(fixture.id)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      <Plus size={16} /> Add Match
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(fixture.boardResults || []).map((board, idx) => (
                      <div key={board.gameId || idx} className="admin-board-item" style={{ 
                        background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '12px',
                        display: 'grid', gridTemplateColumns: '1fr 180px 1fr 40px', gap: '12px', alignItems: 'center',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ position: 'relative' }}>
                          <User size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                          <select 
                            className="input-field" style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                            value={board.player1}
                            onChange={(e) => updateBoard(fixture, board.gameId, 'player1', e.target.value)}
                          >
                            <option value="">Player 1</option>
                            {allPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>

                        <select 
                          className="input-field" style={{ fontSize: '0.85rem', textAlign: 'center', fontWeight: 800, border: '1px solid var(--primary)', color: 'var(--primary)' }}
                          value={board.result}
                          onChange={(e) => updateBoard(fixture, board.gameId, 'result', e.target.value)}
                        >
                          <option value="*">MATCHING RESULT</option>
                          <option value="1-0">P1 WIN (2–0)</option>
                          <option value="0-1">P2 WIN (0–2)</option>
                          <option value="1/2-1/2">DRAW (1–1)</option>
                        </select>

                        <div style={{ position: 'relative' }}>
                          <User size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                          <select 
                            className="input-field" style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                            value={board.player2}
                            onChange={(e) => updateBoard(fixture, board.gameId, 'player2', e.target.value)}
                          >
                            <option value="">Player 2</option>
                            {allPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>

                        <button onClick={() => deleteBoard(fixture.id, board.gameId)} className="btn-icon" style={{ color: 'var(--danger)', padding: '10px' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
