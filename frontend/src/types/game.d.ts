export type Action =
  | 'forward'
  | 'turnLeft'
  | 'turnRight'
  | 'jump'
  | 'use'
  | 'loop';

export type CellType = 'path' | 'ground';

export type ObjectType =
  | 'start'
  | 'finish'
  | 'key'
  | 'fence'
  | 'obstacle'
  | null;

export interface Level {
  index: number;
  name: string;
  description: string;
  actions: Action[];
  levelMatrix: CellType[][];
  objectsMatrix: (ObjectType | null)[][];
}
