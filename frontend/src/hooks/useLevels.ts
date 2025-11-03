import { useState, useEffect } from 'react';
import type { Level } from '../types/game';
import levelsData from '../data/levels.json';

export function useLevels() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const loadedLevels = levelsData as Level[];
      setLevels(loadedLevels);
      setLoading(false);
    } catch (err) {
      setError('Failed to load levels');
      setLoading(false);
    }
  }, []);

  const getLevelByIndex = (index: number): Level | undefined => {
    return levels.find((level) => level.index === index);
  };

  return {
    levels,
    loading,
    error,
    getLevelByIndex,
  };
}
