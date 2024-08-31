import { EventEmitter } from "events";

import Dnd from "./Dnd";
import isHTMLElement from "./isHTMLElement";
import offsetFromEvent from "./offsetFromEvent";
import { DND_EVENT, IDragItem } from "./type";
import { IDragData, IPoint, VECTOR } from "./type";
import vectorFromEvent from "./vectorFromEvent";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface DragListenable<E extends HTMLElement, I extends IDragItem> {
  addListener(event: DND_EVENT, listener: (data: IDragData) => void): this;
}

class DragListenable<
  E extends HTMLElement = HTMLElement,
  I extends IDragItem = IDragItem,
> extends EventEmitter {
  private dnd: Dnd;
  private dragStartEmitted = false;
  private el: E;
  private item: I | null = null;
  private source: IPoint | null = null;
  private prevPoint: IPoint | null = null;
  private offset: {
    x: number;
    y: number;
  } | null = null;
  private vector: {
    x: VECTOR;
    y: VECTOR;
  } | null = null;

  constructor(dnd: Dnd, el: E, native: boolean = false, item?: I) {
    super();
    this.dnd = dnd;
    this.el = el;
    this.item = item != null ? item : null;
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.getWindow = this.getWindow.bind(this);

    if (native && isHTMLElement(this.el, this.getWindow())) {
      this.el.addEventListener("dragstart", this.onDragStart);
      this.el.draggable = true;
      return;
    }

    if (!native) {
      this.el.addEventListener("mousedown", this.onMouseDown as EventListener);

      return;
    }

    console.error(`Can't add drag to ${this.el}`);
  }

  private getWindow() {
    return this.el.ownerDocument.defaultView || window;
  }

  private onMouseDown(event: MouseEvent) {
    this.clean();
    this.dnd.activeDrag(this);
    this.source = {
      x: event.screenX,
      y: event.screenY,
    };
    this.prevPoint = {
      x: event.screenX,
      y: event.screenY,
    };
    this.offset = {
      x: 0,
      y: 0,
    };
    this.vector = {
      x: 0,
      y: 0,
    };
    this.getWindow().addEventListener("mousemove", this.onMouseMove);
    this.getWindow().addEventListener("mouseup", this.onMouseUp);
  }

  private onMouseUp(event: MouseEvent) {
    this.emit(DND_EVENT.DRAG_END, event, {
      source: this.source,
      offset: this.offset,
      vector: this.vector,
      screen: {
        x: event.screenX,
        y: event.screenY,
      },
    });

    this.getWindow().removeEventListener("mousemove", this.onMouseMove);
    this.getWindow().removeEventListener("mouseup", this.onMouseUp);
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.dnd.isActiveDrag(this)) {
      return;
    }
    if (this.dragStartEmitted === false) {
      this.emit(DND_EVENT.DRAG_START, event, {
        source: this.source,
        offset: this.offset,
        vector: this.vector,
        screen: {
          x: event.screenX,
          y: event.screenY,
        },
      });
      this.dnd.setDragging(true);
      this.dragStartEmitted = true;
    }

    this.vector = vectorFromEvent(event, this.prevPoint);
    this.prevPoint = {
      x: event.screenX,
      y: event.screenY,
    };
    this.offset = offsetFromEvent(event, this.source);
    this.emit(DND_EVENT.DRAG, event, {
      source: this.source,
      offset: this.offset,
      vector: this.vector,
      screen: {
        x: event.screenX,
        y: event.screenY,
      },
    });
  }

  private onDragStart(event: DragEvent) {
    this.clean();
    this.dnd.activeDrag(this);

    this.source = {
      x: event.screenX,
      y: event.screenY,
    };
    this.prevPoint = {
      x: event.screenX,
      y: event.screenY,
    };
    this.offset = {
      x: 0,
      y: 0,
    };
    this.vector = {
      x: 0,
      y: 0,
    };
    this.emit(DND_EVENT.DRAG_START, event, {
      source: this.source,
      offset: this.offset,
      vector: this.vector,
      screen: {
        x: event.screenX,
        y: event.screenY,
      },
    });

    if (isHTMLElement(this.el, this.el.ownerDocument.defaultView || window)) {
      this.el.addEventListener("drag", this.onDrag);
      this.el.addEventListener("dragend", this.onDragEnd);
    } else {
      console.error(`Can't add drag to ${this.el}`);
    }
  }

  private onDrag(event: DragEvent) {
    this.vector = vectorFromEvent(event, this.prevPoint);
    this.prevPoint = {
      x: event.screenX,
      y: event.screenY,
    };
    this.offset = offsetFromEvent(event, this.source);
    if (event.screenX === 0 && event.screenY === 0) {
      return;
    }
    this.emit(DND_EVENT.DRAG, event, {
      source: this.source,
      offset: this.offset,
      vector: this.vector,
      screen: {
        x: event.screenX,
        y: event.screenY,
      },
    });
  }

  private onDragEnd(event: DragEvent) {
    this.vector = vectorFromEvent(event, this.prevPoint);
    this.offset = offsetFromEvent(event, this.source);

    const dropOut =
      !this.dnd.dropped &&
      (event.clientX < 0 ||
        event.clientY < 0 ||
        event.clientX > document.body.clientWidth ||
        event.clientY > document.body.clientHeight);
    this.emit(DND_EVENT.DRAG_END, event, {
      source: this.source,
      offset: this.offset,
      vector: this.vector,
      screen: {
        x: event.screenX,
        y: event.screenY,
      },
      dropOut: dropOut,
    });

    if (isHTMLElement(this.el, this.el.ownerDocument.defaultView || window)) {
      this.el.removeEventListener("drag", this.onDrag);
      this.el.removeEventListener("dragend", this.onDragEnd);
    } else {
      console.error(`Can't add drag to ${this.el}`);
    }
    this.dnd.resetDropped();
  }

  private clean() {
    this.dnd.setDragging(false);
    this.dragStartEmitted = false;
    this.dnd.cleanDrags();
    this.dnd.cleanDrops();
    this.source = null;
    this.offset = null;
    this.vector = null;
  }

  private removeEleListeners() {
    if (isHTMLElement(this.el, this.el.ownerDocument.defaultView || window)) {
      this.el.removeEventListener("dragstart", this.onDragStart);
      this.el.removeEventListener("mousedown", this.onMouseDown);
    }

    return this;
  }

  public dispose = () => {
    this.removeEleListeners();
    this.removeAllListeners();
  };

  public getDraggingItem() {
    return this.item;
  }
}

export default DragListenable;
