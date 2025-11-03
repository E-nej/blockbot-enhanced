import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

export default function Game() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-center text-4xl font-bold text-white">BlockBot</h1>
        <div className="flex flex-col gap-4">
          <Button
            size="xl"
            className="bg-primary-600 hover:bg-primary-700 w-64 font-bold"
            onClick={() => navigate('/game/levels')}
          >
            Play Game
          </Button>
          <Button size="xl" color="gray" className="w-64 font-bold" disabled>
            Create Session
          </Button>
        </div>
      </div>
    </div>
  );
}
