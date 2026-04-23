import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicView from './pages/PublicView';
import AdminView from './pages/AdminView';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { seededTeams, seededFixtures } from './seedData';
import type { Team, Fixture } from './types';
import { ErrorBoundary } from './ErrorBoundary';

function App() {
  const [teams, setTeams] = useFirebaseSync<Team[]>('chase_gm_teams', []);
  const [, setFixtures] = useFirebaseSync<Fixture[]>('chase_gm_fixtures', []);

  useEffect(() => {
    // Determine if arrays are truly empty (not just loading)
    const storedTeams = localStorage.getItem('chase_gm_teams');
    const storedFixtures = localStorage.getItem('chase_gm_fixtures');
    
    // Safety check: if there is no string in DB at all, seed the dummy data!
    if (!storedTeams && !storedFixtures && (!teams || teams.length === 0)) {
      console.log('Seeding Database with predefined Matches...');
      setTeams(seededTeams);
      setFixtures(seededFixtures);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;

