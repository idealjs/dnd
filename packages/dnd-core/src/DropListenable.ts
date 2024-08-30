import { EventEmitter } from "events";

import Dnd from "./Dnd";
import isHTMLElement from "./isHTMLElement";
import { DND_EVENT, IDragItem } from "./type";
import { IDropData, IPoint } from "./type";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface DropListenable<E extends HTMLElement> {
  addListener<I extends IDragItem>(
    event: DND_EVENT,
    listener: (ev: MouseEvent, data: IDropData<I>) => void,
  ): this;
}

class DropListenable<E extends HTMLElement = HTMLElement> extends EventEmitter {
  private dnd: Dnd;
  private clientPosition: IPoint | null = null;
  private el: E;
  private allowBubble: boolean;
  constructor(
    dnd: Dnd,
    el: E,
    native: boolean = false,
    allowBubble: boolean = false,
  ) {
    super();
    this.dnd = dnd;
    this.el = el;
    this.allowBubble = allowBubble;
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onDragover = this.onDragover.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragleave = this.onDragleave.bind(this);
    this.onDrop = this.onDrop.bind(this);

    if (native && isHTMLElement(el, el.ownerDocument.defaultView || window)) {
      el.addEventListener("dragover", this.onDragover);
      el.addEventListener("dragenter", this.onDragEnter);
      el.addEventListener("dragleave", this.onDragleave);
      el.addEventListener("drop", this.onDrop);
      return;
    }
    if (!native) {
      el.addEventListener("mouseup", this.onMouseUp as EventListener);
      el.addEventListener("mousemove", this.onMouseMove as EventListener);
      el.addEventListener("mouseenter", this.onMouseEnter as EventListener);
      el.addEventListener("mouseleave", this.onMouseLeave as EventListener);
      return;
    }

    console.error(`Can't add drop listener to ${el}`);
  }

  private onMouseUp(event: MouseEvent) {
    if (this.dnd.isDragging() && this.dnd.canDrop(this)) {
      if (!this.allowBubble) {
        this.dnd.cleanDrops();
      }
      this.clientPosition = {
        x: event.clientX,
        y: event.clientY,
      };
      this.emit(DND_EVENT.DROP, event, {
        clientPosition: this.clientPosition,
        item: this.dnd.getDraggingItem(),
      });
      this.clientPosition = null;
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (this.dnd.isDragging()) {
      this.clientPosition = {
        x: event.clientX,
        y: event.clientY,
      };
      this.emit(DND_EVENT.DRAG_OVER, event, {
        clientPosition: this.clientPosition,
        item: this.dnd.getDraggingItem(),
      });
    }
  }

  private onMouseEnter(event: MouseEvent) {
    if (this.dnd.isDragging()) {
      this.dnd.activeDrop(this);
      this.clientPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      this.emit(DND_EVENT.DRAG_ENTER, event, {
        clientPosition: this.clientPosition,
        item: this.dnd.getDraggingItem(),
      });
    }
  }

  private onMouseLeave(event: MouseEvent) {
    if (this.dnd.isDragging()) {
      this.dnd.deactiveDrop(this);
      this.clientPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      this.emit(DND_EVENT.DRAG_LEAVE, event, {
        clientPosition: this.clientPosition,
        item: this.dnd.getDraggingItem(),
      });
    }
  }

  private onDragover(event: DragEvent) {
    event.preventDefault();
    this.clientPosition = {
      x: event.clientX,
      y: event.clientY,
    };

    this.emit(DND_EVENT.DRAG_OVER, event, {
      clientPosition: this.clientPosition,
      item: this.dnd.getDraggingItem(),
    });
  }

  private onDragEnter(event: DragEvent) {
    this.clientPosition = {
      x: event.clientX,
      y: event.clientY,
    };

    this.emit(DND_EVENT.DRAG_ENTER, event, {
      clientPosition: this.clientPosition,
      item: this.dnd.getDraggingItem(),
    });
  }

  private onDragleave(event: DragEvent) {
    this.clientPosition = {
      x: event.clientX,
      y: event.clientY,
    };

    this.emit(DND_EVENT.DRAG_LEAVE, event, {
      native: true,
      clientPosition: this.clientPosition,
      item: this.dnd.getDraggingItem(),
    });
  }

  private onDrop(event: DragEvent) {
    this.dnd.setDropped();
    this.clientPosition = {
      x: event.clientX,
      y: event.clientY,
    };

    this.emit(DND_EVENT.DROP, event, {
      clientPosition: this.clientPosition,
      item: this.dnd.getDraggingItem(),
    });

    this.clientPosition = null;
  }

  public removeEleListeners() {
    this.el.removeEventListener("dragover", this.onDragover);
    this.el.removeEventListener("dragenter", this.onDragEnter);
    this.el.removeEventListener("dragleave", this.onDragleave);
    this.el.removeEventListener("drop", this.onDrop);

    this.el.removeEventListener("mouseup", this.onMouseUp);
    this.el.removeEventListener("mousemove", this.onMouseMove);
    this.el.removeEventListener("mouseenter", this.onMouseEnter);
    this.el.removeEventListener("mouseleave", this.onMouseLeave);
    return this;
  }
}

export default DropListenable;
