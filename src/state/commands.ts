import type { Command } from './types';

/* The command stack executes no side effects: it stores history and
   notifies, and subscribers derive their state from the stack (the canvas
   derives its bitmap by replaying stroke commands). */

const STORAGE_KEY = 'paint-portfolio-strokes-v1';
const STORAGE_CHARACTER_LIMIT = 500_000;

let undoStack: Command[] = [];
let redoStack: Command[] = [];
const listeners: Array<() => void> = [];

export function getCommands(): readonly Command[] {
  return undoStack;
}

export function pushCommand(command: Command): void {
  undoStack.push(command);
  redoStack = [];
  persist();
  notify();
}

export function undo(): void {
  const command = undoStack.pop();
  if (!command) return;
  redoStack.push(command);
  persist();
  notify();
}

export function redo(): void {
  const command = redoStack.pop();
  if (!command) return;
  undoStack.push(command);
  persist();
  notify();
}

export function subscribeToCommands(listener: () => void): void {
  listeners.push(listener);
}

export function loadPersistedCommands(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return;
    const { version, commands } = parsed as { version?: unknown; commands?: unknown };
    if (version !== 1 || !Array.isArray(commands)) return;
    undoStack = commands.filter(
      (command): command is Command =>
        typeof command === 'object' &&
        command !== null &&
        (command as Command).kind === 'stroke' &&
        Array.isArray((command as { points?: unknown }).points),
    );
    notify();
  } catch {
    // Bad JSON or storage unavailable — start with an empty history.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

/* Only stroke commands persist; the redo stack does not. If the serialized
   history outgrows the size limit, the oldest strokes fall off. */
function persist(): void {
  try {
    let strokes = undoStack.filter((command) => command.kind === 'stroke');
    let serialized = JSON.stringify({ version: 1, commands: strokes });
    while (serialized.length > STORAGE_CHARACTER_LIMIT && strokes.length > 0) {
      strokes = strokes.slice(Math.ceil(strokes.length / 4));
      serialized = JSON.stringify({ version: 1, commands: strokes });
    }
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Quota exceeded — drop the older half and try once more.
      strokes = strokes.slice(Math.ceil(strokes.length / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, commands: strokes }));
    }
  } catch {
    // Storage unavailable (private mode, disabled) — drawing still works.
  }
}
