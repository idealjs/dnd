export interface IDragItem {}

export type VECTOR = 1 | -1 | 0;

export interface IDragData {
  source: IPoint;
  offset: IPoint;
  vector: IPoint;
  screen: IPoint;
  dropOut?: boolean;
}

export interface IDropData<I extends IDragItem> {
  item: I | null;
  clientPosition: IPoint;
}

export interface IPoint {
  x: number;
  y: number;
}

export enum DND_EVENT {
  DRAG = "DND_EVENT/DRAG",
  DRAG_END = "DND_EVENT/DRAG_END",
  DRAG_ENTER = "DND_EVENT/DRAG_ENTER",
  DRAG_LEAVE = "DND_EVENT/DRAG_LEAVE",
  DRAG_OVER = "DND_EVENT/DRAG_OVER",
  DRAG_START = "DND_EVENT/DRAG_START",
  DROP = "DND_EVENT/DROP",
}
