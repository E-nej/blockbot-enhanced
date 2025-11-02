import { LevelSelect } from '../components/game/LevelSelect';
import { useLevels } from '../hooks/useLevels';

export default function Game() {
  const { levels, loading, error } = useLevels();

  const handleLevelSelect = (levelIndex: number) => {
    console.log(`Selected level ${levelIndex}`);
    // TODO: Start the selected level
  };

  return (
    <LevelSelect
      levels={levels}
      onLevelSelect={handleLevelSelect}
      loading={loading}
      error={error}
    />
  );
}
