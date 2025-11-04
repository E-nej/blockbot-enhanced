import { Routes, Route } from 'react-router-dom';
import { ThemeInit } from '../.flowbite-react/init';
import NavbarComponent from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import LevelSelect from './pages/LevelSelect';
import Leaderboards from './pages/Leaderboards';
import Auth from './pages/Auth';

export default function App() {
  return (
    <>
      <ThemeInit />
      <div
        className="min-h-screen bg-top bg-repeat-y shadow-lg shadow-white"
        style={{
          backgroundImage: 'url(/background.svg)',
          backgroundSize: '100% auto',
        }}
      >
        <div className="sticky top-0 z-50">
          <NavbarComponent />
        </div>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/game/levels" element={<LevelSelect />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
