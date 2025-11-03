import { useState } from 'react';
import { LevelSelect } from '../components/game/LevelSelect';
import { GamePlay } from '../components/game/GamePlay';
import { useLevels } from '../hooks/useLevels';
import type { Level } from '../types/game';

export default function Game() {
  const { levels, loading, error } = useLevels();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleLevelSelect = (levelIndex: number) => {
    const level = levels.find((l) => l.index === levelIndex);
    if (level) {
      setSelectedLevel(level);
    }
  };

  const handleBack = () => {
    setSelectedLevel(null);
  };

  if (selectedLevel) {
    return <GamePlay level={selectedLevel} onBack={handleBack} />;
  }

  return (
    <LevelSelect
      levels={levels}
      onLevelSelect={handleLevelSelect}
      loading={loading}
      error={error}
    />
  );
}
