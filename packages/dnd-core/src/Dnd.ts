import DragListenable from "./DragListenable";
import DropListenable from "./DropListenable";
import { IDragItem } from "./type";

class Dnd {
  private dragging = false;
  private _dropped = false;
  private activeDrags: DragListenable[] = [];
  private activeDrops: DropListenable[] = [];

  public draggable<T extends HTMLElement, I extends IDragItem>(
    ele: T,
    options?: {
      native?: boolean;
      item?: I;
    },
  ) {
    const listenable = new DragListenable(
      this,
      ele,
      options?.native,
      options?.item,
    );

    return listenable;
  }

  public droppable<T extends HTMLElement>(
    ele: T,
    options?: {
      native?: boolean;
      allowBubble?: boolean;
    },
  ) {
    const listenable = new DropListenable(this, ele, options?.native);
    return listenable;
  }

  public setDropped() {
    this._dropped = true;
  }

  public resetDropped() {
    this._dropped = false;
  }

  public get dropped() {
    return this._dropped;
  }

  public setDragging = (dragging: boolean) => {
    this.dragging = dragging;
  };

  public getDraggingItem() {
    return this.activeDrags[0]?.getDraggingItem();
  }

  public activeDrag(drag: DragListenable) {
    this.activeDrags.push(drag);
  }

  public cleanDrags() {
    this.activeDrags = [];
  }

  public activeDrop(drop: DropListenable) {
    this.activeDrops.push(drop);
  }

  public deactiveDrop(drop: DropListenable) {
    this.activeDrops = this.activeDrops.filter((d) => d !== drop);
  }

  public cleanDrops() {
    this.activeDrops = [];
  }

  public canDrop(drop: DropListenable) {
    return this.activeDrops.includes(drop);
  }

  public isActiveDrag(drag: DragListenable) {
    return this.activeDrags[0] === drag;
  }

  public isDragging() {
    return this.dragging;
  }
}

export default Dnd;
