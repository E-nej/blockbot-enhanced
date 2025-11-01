import { Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import Leaderboards from './pages/Leaderboards';

export default function App() {
  return (
    <div
      className="min-h-screen bg-top bg-repeat-y shadow-lg shadow-white"
      style={{
        backgroundImage: 'url(/background.svg)',
        backgroundSize: '100% auto',
      }}
    >
      <NavbarComponent />
      <main className="pt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
        </Routes>
      </main>
    </div>
  );
}
