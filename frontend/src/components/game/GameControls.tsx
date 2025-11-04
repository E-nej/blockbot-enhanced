import { Button } from 'flowbite-react';
import { HiChevronRight, HiRefresh } from 'react-icons/hi';

interface GameControlsProps {
  onExecute: () => void;
  onReset: () => void;
  isExecuting: boolean;
  hasActions: boolean;
}

export function GameControls({
  onExecute,
  onReset,
  isExecuting,
  hasActions,
}: GameControlsProps) {
  return (
    <div className="flex w-full justify-center gap-4">
      <Button
        onClick={onExecute}
        outline
        className="border-primary-500 bg-primary-600 hover:bg-primary-600 w-48 border-2 font-bold text-white"
        disabled={isExecuting || !hasActions}
      >
        <HiChevronRight className="mr-2 h-5 w-5" />
        {isExecuting ? 'Izvajanje...' : 'Zaženi kodo'}
      </Button>
      <Button
        onClick={onReset}
        outline
        className="w-48 border-2 border-white bg-transparent text-white hover:bg-white/10"
        disabled={isExecuting}
      >
        <HiRefresh className="mr-2 h-5 w-5" />
        Ponastavi
      </Button>
    </div>
  );
}
