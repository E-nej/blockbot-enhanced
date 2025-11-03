import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Action, GameAction } from '../../types/game';

interface ActionBuilderProps {
  availableActions: Action[];
  actions: GameAction[];
  onActionsChange: (actions: GameAction[]) => void;
}

interface ActionBlockProps {
  action: Action;
  isDragging?: boolean;
}

const actionAssets: Record<Action, string> = {
  forward: '/game/actions/forward.svg',
  turnLeft: '/game/actions/turn-left.svg',
  turnRight: '/game/actions/turn-right.svg',
  jump: '/game/actions/jump.svg',
  use: '/game/actions/use.svg',
  loop: '/game/actions/loop.svg',
};

const actionLabels: Record<Action, string> = {
  forward: 'Move Forward',
  turnLeft: 'Turn Left',
  turnRight: 'Turn Right',
  jump: 'Jump',
  use: 'Use Item',
  loop: 'Loop',
};

function ActionBlock({ action, isDragging }: ActionBlockProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={actionAssets[action]}
        alt={actionLabels[action]}
        className="h-16 w-16"
      />
    </div>
  );
}

interface SortableActionProps {
  action: GameAction;
  id: string;
  onRemove: () => void;
}

function SortableAction({ action, id, onRemove }: SortableActionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Filter out 'loop' since we're not handling it yet
  if (typeof action === 'object') return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative"
    >
      <ActionBlock action={action as Action} isDragging={isDragging} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

interface DraggableActionProps {
  action: Action;
  id: string;
}

function DraggableAction({ action, id }: DraggableActionProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ActionBlock action={action} isDragging={isDragging} />
    </div>
  );
}

export function ActionBuilder({
  availableActions,
  actions,
  onActionsChange,
}: ActionBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const filteredActions = availableActions.filter((a) => a !== 'loop');

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const isFromPalette = activeId.startsWith('palette-');
    const isFromActions = activeId.startsWith('action-');
    const isOverDropzone = overId === 'actions-dropzone';
    const isOverAction = overId.startsWith('action-');

    // Add new action from palette
    if (isFromPalette && (isOverDropzone || isOverAction)) {
      const action = activeId.replace('palette-', '') as Action;

      if (isOverDropzone) {
        onActionsChange([...actions, action]);
      } else {
        const index = parseInt(overId.replace('action-', ''));
        const newActions = [...actions];
        newActions.splice(index, 0, action);
        onActionsChange(newActions);
      }
    }
    // Reorder existing actions
    else if (isFromActions && isOverAction) {
      const oldIndex = parseInt(activeId.replace('action-', ''));
      const newIndex = parseInt(overId.replace('action-', ''));

      if (oldIndex !== newIndex) {
        onActionsChange(arrayMove(actions, oldIndex, newIndex));
      }
    }
  };

  const handleRemoveAction = (index: number) => {
    onActionsChange(actions.filter((_, i) => i !== index));
  };

  const getActiveAction = (): Action | null => {
    if (!activeId) return null;
    if (activeId.startsWith('palette-')) {
      return activeId.replace('palette-', '') as Action;
    }
    if (activeId.startsWith('action-')) {
      return actions[parseInt(activeId.replace('action-', ''))] as Action;
    }
    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Available Actions
          </h4>
          <div className="flex gap-2">
            {filteredActions.map((action) => (
              <DraggableAction
                key={`palette-${action}`}
                id={`palette-${action}`}
                action={action}
              />
            ))}
          </div>
        </div>

        <ActionsDropZone actions={actions} onRemove={handleRemoveAction} />
      </div>

      <DragOverlay>
        {getActiveAction() && <ActionBlock action={getActiveAction()!} />}
      </DragOverlay>
    </DndContext>
  );
}

interface ActionsDropZoneProps {
  actions: GameAction[];
  onRemove: (index: number) => void;
}

function ActionsDropZone({ actions, onRemove }: ActionsDropZoneProps) {
  const { setNodeRef } = useDroppable({ id: 'actions-dropzone' });

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-700">
        Your Action Sequence ({actions.length})
      </h4>
      <SortableContext
        items={actions.map((_, index) => `action-${index}`)}
        strategy={rectSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex min-h-[100px] flex-wrap gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4"
        >
          {actions.length === 0 ? (
            <p className="w-full text-center text-sm text-gray-400">
              Drag actions here to build your sequence
            </p>
          ) : (
            actions.map((action, index) => (
              <SortableAction
                key={`action-${index}`}
                id={`action-${index}`}
                action={action}
                onRemove={() => onRemove(index)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
