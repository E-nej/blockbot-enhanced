import { useState, useRef } from 'react';
import { executeActions } from '../../game/engine';
import { ActionBuilder } from './ActionBuilder';
import { LevelGrid } from './LevelGrid';
import { GameControls } from './GameControls';
import type { Level, GameAction, GameState, Direction } from '../../types/game';

interface GamePlayProps {
  level: Level;
  onBack: () => void;
}

export function GamePlay({ level, onBack }: GamePlayProps) {
  const [actions, setActions] = useState<GameAction[]>([]);
  const [result, setResult] = useState<GameState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const rotationRef = useRef(0);
  const lastDirectionRef = useRef<Direction>('up');

  const handleExecute = async () => {
    setIsExecuting(true);
    await executeActions(level, actions, (state) => {
      setResult({ ...state });
    });
    setIsExecuting(false);
  };

  const handleReset = () => {
    setActions([]);
    setResult(null);
    rotationRef.current = 0;
    lastDirectionRef.current = 'up';
  };

  return (
    <div className="relative z-0 flex h-[calc(100vh-64px)] items-center justify-center p-8">
      <div
        className="relative h-full w-full overflow-hidden rounded-[8rem] bg-[#0F2F2C]"
        style={{
          boxShadow: `
            0 0 0 8px #C2CED9,
            0 0 0 128px #EBEEF3
          `,
        }}
      >
        <div className="flex h-full w-full flex-col justify-center gap-4 p-12">
          <div className="flex items-start justify-between gap-8">
            <div className="w-[40%]">
              <LevelGrid
                level={level}
                result={result}
                rotationRef={rotationRef}
                lastDirectionRef={lastDirectionRef}
              />
            </div>

            <div className="flex h-full w-[60%]">
              <div className="w-full">
                <ActionBuilder
                  availableActions={level.actions}
                  actions={actions}
                  onActionsChange={setActions}
                />
              </div>
            </div>
          </div>

          <GameControls
            onExecute={handleExecute}
            onReset={handleReset}
            isExecuting={isExecuting}
            hasActions={actions.length > 0}
          />

          {result && (
            <div className="mx-8 mt-4 rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Complete:</span>{' '}
                  <span
                    className={
                      result.isComplete ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {result.isComplete ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Failed:</span>{' '}
                  <span
                    className={
                      result.isFailed ? 'text-red-600' : 'text-green-600'
                    }
                  >
                    {result.isFailed ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
