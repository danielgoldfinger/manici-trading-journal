import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDarkMode } from './hooks/useDarkMode';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Log from './pages/Log';
import Journal from './pages/Journal';
import Stats from './pages/Stats';
import Plan from './pages/Plan';
import Settings from './pages/Settings';

function App() {
  useDarkMode();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route element={<Layout />}>
          <Route path="/log" element={<Log />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/log" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
