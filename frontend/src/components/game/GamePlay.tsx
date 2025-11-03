import { useState, useRef } from 'react';
import { Button } from 'flowbite-react';
import { executeActions } from '../../game/engine';
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

  const testActions: GameAction[] = [
    'turnRight',
    'turnRight',
    'turnRight',
    'turnRight',
    'turnRight',
    'forward',
    'jump',
    'turnLeft',
    'turnLeft',
    'turnLeft',
    'turnLeft',
    'forward',
    'use',
    'forward',
  ];
  const testActionsWithLoop: GameAction[] = [
    'turnRight',
    'turnRight',
    'forward',
    'jump',
    'turnLeft',
    'forward',
    'use',
    'forward',
    {
      type: 'loop',
      iterations: 3,
      actions: ['forward', 'forward', 'turnLeft'],
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <Button onClick={onBack} className="mb-4">
          ← Back to Level Select
        </Button>
        <h2 className="text-3xl font-bold">
          Level {level.index}: {level.name}
        </h2>
        <p className="text-gray-600">{level.description}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold">Level Grid</h3>
          <div
            className="relative grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${level.levelMatrix[0].length}, minmax(0, 1fr))`,
            }}
          >
            {level.levelMatrix.map((row, y) =>
              row.map((cell, x) => {
                const obj = level.objectsMatrix[y][x];
                const currentObj = result ? result.objectsMatrix[y][x] : obj;
                const isStartPosition = obj === 'start';

                return (
                  <div
                    key={`${x}-${y}`}
                    className="relative aspect-square rounded-lg"
                    style={{
                      backgroundImage: `url(/game/tiles/${cell}.png)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!result && isStartPosition && (
                      <img
                        src="/game/objects/start.svg"
                        alt="Start"
                        className="absolute inset-0 h-full w-full p-2"
                      />
                    )}
                    {result && obj === 'start' && (
                      <img
                        src="/game/objects/start.svg"
                        alt="Start"
                        className="absolute inset-0 h-full w-full p-2"
                      />
                    )}
                    {currentObj === 'finish' && (
                      <img
                        src="/game/objects/finish.svg"
                        alt="Finish"
                        className="absolute inset-0 h-full w-full p-2"
                      />
                    )}
                    {currentObj === 'key' && (
                      <img
                        src="/game/objects/key.svg"
                        alt="Key"
                        className="absolute inset-0 h-full w-full p-4"
                      />
                    )}
                    {currentObj === 'lock' && (
                      <img
                        src="/game/objects/lock.svg"
                        alt="Lock"
                        className="absolute inset-0 h-full w-full p-4"
                      />
                    )}
                    {currentObj === 'obstacle' && (
                      <img
                        src="/game/objects/obstacle.svg"
                        alt="Obstacle"
                        className="absolute inset-0 h-full w-full p-2"
                      />
                    )}
                  </div>
                );
              }),
            )}

            {(() => {
              const playerPos =
                result?.playerPosition ||
                level.objectsMatrix
                  .flatMap((row, y) =>
                    row.map((obj, x) => (obj === 'start' ? { x, y } : null)),
                  )
                  .find((pos) => pos);

              if (!playerPos) return null;

              const cellSize = 100 / level.levelMatrix[0].length;
              const isJumping = result?.isJumping || false;

              const currentDirection = result?.playerDirection || 'up';
              const directionToDegrees: Record<Direction, number> = {
                up: 0,
                right: 90,
                down: 180,
                left: 270,
              };

              if (result && currentDirection !== lastDirectionRef.current) {
                const lastDeg = directionToDegrees[lastDirectionRef.current];
                const currentDeg = directionToDegrees[currentDirection];
                let delta = currentDeg - lastDeg;

                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;

                rotationRef.current += delta;
                lastDirectionRef.current = currentDirection;
              }

              return (
                <>
                  {isJumping && (
                    <div
                      className="bg-primary-500 pointer-events-none absolute animate-pulse rounded-full opacity-80 blur-md"
                      style={{
                        left: `calc(${playerPos.x * cellSize}% + 0.25rem)`,
                        top: `calc(${playerPos.y * cellSize}% + 0.25rem)`,
                        width: `calc(${cellSize}% - 0.5rem)`,
                        height: `calc(${cellSize}% - 0.5rem)`,
                      }}
                    />
                  )}

                  <img
                    src="/game/player/robot.svg"
                    alt="Player"
                    className="pointer-events-none absolute transition-all duration-300 ease-in-out"
                    style={{
                      left: `calc(${playerPos.x * cellSize}% + 0.25rem)`,
                      top: `calc(${playerPos.y * cellSize}% + 0.25rem)`,
                      width: `calc(${cellSize}% - 0.5rem)`,
                      height: `calc(${cellSize}% - 0.5rem)`,
                      padding: '0.25rem',
                      transform: `rotate(${rotationRef.current}deg)`,
                    }}
                  />
                </>
              );
            })()}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold">Actions</h3>

          <div className="mb-4 space-y-2">
            <Button
              onClick={() => setActions(testActions)}
              color="light"
              className="w-full"
            >
              Load Test Actions (Simple)
            </Button>
            <Button
              onClick={() => setActions(testActionsWithLoop)}
              color="light"
              className="w-full"
            >
              Load Test Actions (With Loop)
            </Button>
          </div>

          <div className="mb-4 rounded bg-gray-100 p-4">
            <pre className="text-sm">{JSON.stringify(actions, null, 2)}</pre>
          </div>

          <div className="mb-4 flex gap-2">
            <Button
              onClick={handleExecute}
              color="success"
              className="flex-1"
              disabled={isExecuting || actions.length === 0}
            >
              {isExecuting ? 'Executing...' : 'Execute Actions'}
            </Button>
            <Button
              onClick={handleReset}
              color="gray"
              className="flex-1"
              disabled={isExecuting}
            >
              Reset
            </Button>
          </div>

          {result && (
            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
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
                <div>
                  <span className="font-semibold">Position:</span> (
                  {result.playerPosition.x}, {result.playerPosition.y})
                </div>
                <div>
                  <span className="font-semibold">Direction:</span>{' '}
                  {result.playerDirection}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Inventory:</span>{' '}
                  {result.inventory.length > 0
                    ? result.inventory.join(', ')
                    : 'Empty'}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Time:</span>{' '}
                  {result.timeElapsed}ms
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Move Log:</h4>
                <div className="max-h-48 overflow-y-auto rounded bg-white p-2">
                  {result.moveLog.map((log, i) => (
                    <div
                      key={i}
                      className="border-b py-1 text-sm last:border-b-0"
                    >
                      {i + 1}. {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
