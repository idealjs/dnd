# What is @idealjs/dnd-core

`@idealjs/dnd-core` Is a library that proxies native drag drop and synthesizes drag effects with mouse events.

## Quick Start

synthesizes drag drop

```js
const dnd = new Dnd();

const draggable = dnd
  .draggable(document.getElementById("drag"))
  .addEventListener(DND_EVENT.DRAG, callback);

const droppable = dnd
  .droppable(document.getElementById("drop"))
  .addEventListener(DND_EVENT.DROP, callback);
```

native drag drop

```js
const dnd = new Dnd();

const draggable = dnd
  .draggable(document.getElementById("drag"), { native: true })
  .addEventListener(DND_EVENT.DRAG, callback);

const droppable = dnd
  .droppable(document.getElementById("drop"), { native: true })
  .addEventListener(DND_EVENT.DROP, callback);
```
