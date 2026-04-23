import { Routes, Route } from 'react-router-dom';
import PublicView from './pages/PublicView';
import AdminView from './pages/AdminView';
import { ErrorBoundary } from './ErrorBoundary';

function App() {
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
