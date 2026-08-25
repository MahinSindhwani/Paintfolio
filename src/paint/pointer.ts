import { pushCommand } from '../state/commands';
import { getActiveTool, getInkColor, subscribeToStore } from '../state/store';
import type { Point } from '../state/types';
import { enqueuePlots, getPaintSize } from './canvas';
import {
  pencilStrokeBegin,
  pencilStrokeCancel,
  pencilStrokeEnd,
  pencilStrokeMove,
} from './tools/pencil';

/* Listeners attach once to the hit layer and dispatch on the active tool —
   never attached or detached on tool change. Client coordinates convert to
   paint units at this boundary; nothing past it sees clientX/Y. */

let activePointerId: number | null = null;

export function setupPointerInput(hitLayer: HTMLElement): void {
  hitLayer.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || activePointerId !== null) return;
    activePointerId = event.pointerId;
    try {
      hitLayer.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers can't be captured; the drag still works, it just
      // stops at the layer edge instead of following the pointer out.
    }
    const point = toPaintPoint(hitLayer, event);
    const tool = getActiveTool();
    switch (tool) {
      case 'pencil':
        enqueuePlots(pencilStrokeBegin(point, getInkColor()));
        break;
      case 'brush':
      case 'eraser':
      case 'select':
      case 'fill':
      case 'picker':
      case 'text':
        break; // Selectable, not implemented yet.
      default: {
        const unhandled: never = tool;
        throw new Error(`unhandled tool: ${JSON.stringify(unhandled)}`);
      }
    }
  });

  hitLayer.addEventListener('pointermove', (event) => {
    if (event.pointerId !== activePointerId) return;
    // Coalesced events keep fast swipes faithful; older Safari lacks them
    // and Bresenham bridges the gaps.
    const samples = event.getCoalescedEvents?.() ?? [event];
    for (const sample of samples) {
      enqueuePlots(pencilStrokeMove(toPaintPoint(hitLayer, sample)));
    }
  });

  hitLayer.addEventListener('pointerup', (event) => {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    const result = pencilStrokeEnd(toPaintPoint(hitLayer, event));
    if (result) {
      enqueuePlots(result.plots);
      pushCommand(result.command);
    }
  });

  hitLayer.addEventListener('pointercancel', (event) => {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    const command = pencilStrokeCancel();
    if (command) pushCommand(command);
  });

  const applyToolCursor = () => {
    for (const className of [...hitLayer.classList]) {
      if (className.startsWith('tool-')) hitLayer.classList.remove(className);
    }
    hitLayer.classList.add(`tool-${getActiveTool()}`);
  };
  applyToolCursor();
  subscribeToStore(applyToolCursor);
}

function toPaintPoint(hitLayer: HTMLElement, event: { clientX: number; clientY: number }): Point {
  const rect = hitLayer.getBoundingClientRect();
  const { width, height } = getPaintSize();
  const x = Math.floor((event.clientX - rect.left) / (rect.width / width));
  const y = Math.floor((event.clientY - rect.top) / (rect.height / height));
  return {
    x: Math.min(Math.max(x, 0), width - 1),
    y: Math.min(Math.max(y, 0), height - 1),
  };
}
