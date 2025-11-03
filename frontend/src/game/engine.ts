import type {
  Level,
  GameState,
  Direction,
  Position,
  ObjectType,
  Action,
  GameAction,
  LoopAction,
  CellType,
} from '../types/game';

const DIRECTION_DELTAS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const TURN_LEFT: Record<Direction, Direction> = {
  up: 'left',
  left: 'down',
  down: 'right',
  right: 'up',
};

const TURN_RIGHT: Record<Direction, Direction> = {
  up: 'right',
  right: 'down',
  down: 'left',
  left: 'up',
};

function findStartPosition(
  objectsMatrix: (ObjectType | null)[][],
): Position | null {
  for (let y = 0; y < objectsMatrix.length; y++) {
    for (let x = 0; x < objectsMatrix[y].length; x++) {
      if (objectsMatrix[y][x] === 'start') {
        return { x, y };
      }
    }
  }
  return null;
}

export function initializeGameState(level: Level): GameState {
  const startPos = findStartPosition(level.objectsMatrix);

  if (!startPos) {
    throw new Error('No start position found in level');
  }

  return {
    playerPosition: startPos,
    playerDirection: 'up',
    inventory: [],
    objectsMatrix: level.objectsMatrix.map((row) => [...row]),
    isComplete: false,
    isFailed: false,
    timeElapsed: 0,
    moveLog: ['Game started'],
  };
}

function isValidPosition(
  pos: Position,
  levelMatrix: CellType[][],
  objectsMatrix: (ObjectType | null)[][],
  state: GameState,
  isJumping: boolean = false,
): boolean {
  if (
    pos.y < 0 ||
    pos.y >= levelMatrix.length ||
    pos.x < 0 ||
    pos.x >= levelMatrix[0].length
  ) {
    return false;
  }

  if (levelMatrix[pos.y][pos.x] !== 'path') {
    return false;
  }

  const obj = objectsMatrix[pos.y][pos.x];

  if (obj === 'obstacle' && !isJumping) {
    return false;
  }

  if (obj === 'lock') {
    return false;
  }

  return true;
}

function moveForward(
  state: GameState,
  level: Level,
  isJumping: boolean = false,
): GameState {
  const delta = DIRECTION_DELTAS[state.playerDirection];
  const newPos: Position = {
    x: state.playerPosition.x + delta.x,
    y: state.playerPosition.y + delta.y,
  };

  if (
    !isValidPosition(
      newPos,
      level.levelMatrix,
      state.objectsMatrix,
      state,
      isJumping,
    )
  ) {
    return {
      ...state,
      moveLog: [
        ...state.moveLog,
        `Forward blocked - stayed at (${state.playerPosition.x}, ${state.playerPosition.y})`,
      ],
    };
  }

  const newState: GameState = {
    ...state,
    playerPosition: newPos,
    moveLog: [...state.moveLog, `Moved forward to (${newPos.x}, ${newPos.y})`],
  };

  const obj = state.objectsMatrix[newPos.y][newPos.x];

  if (obj === 'key') {
    newState.inventory = [...newState.inventory, 'key'];
    newState.objectsMatrix = newState.objectsMatrix.map((row) => [...row]);
    newState.objectsMatrix[newPos.y][newPos.x] = null;
    newState.moveLog = [...newState.moveLog, 'Picked up key'];
  }

  if (obj === 'finish') {
    newState.isComplete = true;
    newState.moveLog = [...newState.moveLog, 'Reached finish! Level complete!'];
  }

  return newState;
}

function turnLeft(state: GameState): GameState {
  const newDirection = TURN_LEFT[state.playerDirection];
  return {
    ...state,
    playerDirection: newDirection,
    moveLog: [...state.moveLog, `Turned left, now facing ${newDirection}`],
  };
}

function turnRight(state: GameState): GameState {
  const newDirection = TURN_RIGHT[state.playerDirection];
  return {
    ...state,
    playerDirection: newDirection,
    moveLog: [...state.moveLog, `Turned right, now facing ${newDirection}`],
  };
}

function jump(state: GameState, level: Level): GameState {
  const loggedState = {
    ...state,
    moveLog: [...state.moveLog, 'Jumping...'],
  };
  return moveForward(loggedState, level, true);
}

function performUseAction(state: GameState): GameState {
  const delta = DIRECTION_DELTAS[state.playerDirection];
  const targetPos: Position = {
    x: state.playerPosition.x + delta.x,
    y: state.playerPosition.y + delta.y,
  };

  if (
    targetPos.y < 0 ||
    targetPos.y >= state.objectsMatrix.length ||
    targetPos.x < 0 ||
    targetPos.x >= state.objectsMatrix[0].length
  ) {
    return {
      ...state,
      moveLog: [...state.moveLog, 'Nothing to use'],
    };
  }

  const obj = state.objectsMatrix[targetPos.y][targetPos.x];

  if (obj === 'lock') {
    if (state.inventory.includes('key')) {
      const newState = {
        ...state,
        objectsMatrix: state.objectsMatrix.map((row) => [...row]),
        inventory: state.inventory.filter((item) => item !== 'key'),
        moveLog: [...state.moveLog, 'Used key to unlock lock'],
      };
      newState.objectsMatrix[targetPos.y][targetPos.x] = null;
      return newState;
    } else {
      return {
        ...state,
        moveLog: [...state.moveLog, 'Need key to unlock lock'],
      };
    }
  }

  return {
    ...state,
    moveLog: [...state.moveLog, 'Nothing to use here'],
  };
}

function executeAction(
  state: GameState,
  action: Action,
  level: Level,
): GameState {
  if (state.isComplete || state.isFailed) {
    return state;
  }

  switch (action) {
    case 'forward':
      return moveForward(state, level);
    case 'turnLeft':
      return turnLeft(state);
    case 'turnRight':
      return turnRight(state);
    case 'jump':
      return jump(state, level);
    case 'use':
      return performUseAction(state);
    default:
      return state;
  }
}

export function executeActions(
  level: Level,
  actions: GameAction[],
  startTime: number = Date.now(),
): GameState {
  let state = initializeGameState(level);

  for (const action of actions) {
    if (typeof action === 'object' && action.type === 'loop') {
      const loopAction = action as LoopAction;
      for (let i = 0; i < loopAction.iterations; i++) {
        for (const loopedAction of loopAction.actions) {
          state = executeAction(state, loopedAction as Action, level);
          if (state.isComplete || state.isFailed) break;
        }
        if (state.isComplete || state.isFailed) break;
      }
    } else {
      state = executeAction(state, action as Action, level);
    }

    if (state.isComplete || state.isFailed) {
      break;
    }
  }

  if (!state.isComplete) {
    state.isFailed = true;
    state.moveLog = [...state.moveLog, 'Failed to reach finish'];
  }

  state.timeElapsed = Date.now() - startTime;

  return state;
}
