import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDarkMode } from './hooks/useDarkMode';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Log from './pages/Log';
import JournalPage from './pages/JournalPage';
import Stats from './pages/Stats';
import Plan from './pages/Plan';
import Settings from './pages/Settings';
import Observations from './pages/Observations';

function App() {
  useDarkMode();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route element={<Layout />}>
          <Route path="/log" element={<Log />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/" element={<Navigate to="/log" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
