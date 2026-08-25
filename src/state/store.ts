import type { Tool } from './types';

/* Source of truth for the active tool and ink color — tools never read CSS
   tokens at runtime. */

export type AppState = { activeTool: Tool; inkColor: string };

const state: AppState = { activeTool: 'pencil', inkColor: '#000000' };
const listeners: Array<(state: AppState) => void> = [];

export function getActiveTool(): Tool {
  return state.activeTool;
}

export function getInkColor(): string {
  return state.inkColor;
}

export function setActiveTool(tool: Tool): void {
  if (tool === state.activeTool) return;
  state.activeTool = tool;
  notify();
}

export function setInkColor(color: string): void {
  if (color === state.inkColor) return;
  state.inkColor = color;
  notify();
}

export function subscribeToStore(listener: (state: AppState) => void): void {
  listeners.push(listener);
}

function notify(): void {
  for (const listener of listeners) listener(state);
}
