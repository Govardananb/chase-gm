import { useState } from 'react';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import type { Team, Fixture, BoardResult } from '../types';
import { Calendar, CheckCircle, Clock, Plus, Trash2, Swords } from 'lucide-react';

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
    <div>
      <div className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} color="var(--primary)" /> Schedule Match
        </h2>
        <form onSubmit={handleCreateFixture} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Set Number</label>
            <input 
              type="number" min="1" placeholder="1" className="input-field"
              value={setNum} onChange={(e) => setSetNum(e.target.value)} required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Team A</label>
            <select className="input-field" value={teamAId} onChange={e => setTeamAId(e.target.value)} required>
              <option value="">Select Team A</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Team B</label>
            <select className="input-field" value={teamBId} onChange={e => setTeamBId(e.target.value)} required>
              <option value="">Select Team B</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Date</label>
            <input 
              type="date" className="input-field"
              value={date} onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '45px' }}>
            <Plus size={18} /> Add Fixture
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(!fixtures || fixtures.length === 0) ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No fixtures scheduled yet.
          </div>
        ) : (
          fixtures.sort((a,b) => Number(a.set) - Number(b.set)).map(fixture => {
            const teamA = (teams || []).find(t => t.id === fixture.teamAId);
            const teamB = (teams || []).find(t => t.id === fixture.teamBId);
            if (!teamA || !teamB) return null;

            const allPlayers = [...teamA.players, ...teamB.players];

            return (
              <div key={fixture.id} className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '8px' }}>Set {fixture.set}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{fixture.date}</span>
                    <button onClick={() => toggleStatus(fixture.id)} className="status-badge" style={{ 
                      border: 'none', cursor: 'pointer', 
                      background: fixture.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      color: fixture.status === 'completed' ? 'var(--success)' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px'
                    }}>
                      {fixture.status === 'completed' ? <><CheckCircle size={14}/> Completed</> : <><Clock size={14}/> Pending</>}
                    </button>
                  </div>
                  <button onClick={() => handleDeleteFixture(fixture.id)} style={{ color: 'var(--danger)', fontSize: '0.875rem' }} className="btn">
                    <Trash2 size={16} /> Delete Fixture
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', margin: '0 0 24px 0', position: 'relative' }}>
                  <div style={{ flex: 1, textAlign: 'right', fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 700 }}>{teamA.name}</div>
                  <div style={{ padding: '0 32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {fixture.teamAScore || 0} – {fixture.teamBScore || 0}
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 700 }}>{teamB.name}</div>
                </div>

                {/* Board Results Management */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Swords size={16} /> Individual Matches
                    </h4>
                    <button onClick={() => addManualBoard(fixture.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Match
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {(fixture.boardResults || []).map((board, idx) => (
                      <div key={board.gameId || idx} style={{ 
                        background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px',
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>M{idx+1}</span>
                          <select 
                            className="input-field" style={{ fontSize: '0.85rem', padding: '6px' }}
                            value={board.player1}
                            onChange={(e) => updateBoard(fixture, board.gameId, 'player1', e.target.value)}
                          >
                            <option value="">Player A</option>
                            {allPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>

                        <select 
                          className="input-field" style={{ fontSize: '0.85rem', padding: '6px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', fontWeight: 700, border: '1px solid var(--primary)' }}
                          value={board.result}
                          onChange={(e) => updateBoard(fixture, board.gameId, 'result', e.target.value)}
                        >
                          <option value="*">Result (TBD)</option>
                          <option value="1-0">Win – Loss</option>
                          <option value="0-1">Loss – Win</option>
                          <option value="1/2-1/2">Draw</option>
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select 
                            className="input-field" style={{ fontSize: '0.85rem', padding: '6px' }}
                            value={board.player2}
                            onChange={(e) => updateBoard(fixture, board.gameId, 'player2', e.target.value)}
                          >
                            <option value="">Player B</option>
                            {allPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                          <button onClick={() => deleteBoard(fixture.id, board.gameId)} style={{ padding: '6px', color: 'var(--danger)', opacity: 0.7 }} className="btn-icon">
                            <Trash2 size={16} />
                          </button>
                        </div>
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
