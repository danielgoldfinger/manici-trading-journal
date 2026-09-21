import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDarkMode } from './hooks/useDarkMode';
import PersonalOSLayout from './components/layout/PersonalOSLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Log from './pages/Log';
import JournalPage from './pages/JournalPage';
import Stats from './pages/Stats';
import Plan from './pages/Plan';
import Settings from './pages/Settings';
import Observations from './pages/Observations';
import Principles from './pages/Principles';
import Schedule from './pages/Schedule';
import Habits from './pages/Habits';
import Fitness from './pages/Fitness';
import Reading from './pages/Reading';
import Wilder from './pages/Wilder';
import News from './pages/News';
import Analytics from './pages/Analytics';

function App() {
  useDarkMode();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route element={<PersonalOSLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/log" element={<Log />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/principles" element={<Principles />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/wilder" element={<Wilder />} />
          <Route path="/news" element={<News />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
