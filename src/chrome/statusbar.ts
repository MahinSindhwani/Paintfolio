import { el } from './dom';

export function createStatusBar(): HTMLElement {
  const help = el('div', 'status-bar-field status-help', [
    'For Help, click Help Topics on the Help Menu.',
  ]);
  return el('div', 'status-bar', [
    help,
    el('div', 'status-bar-field status-cell'),
    el('div', 'status-bar-field status-cell'),
  ]);
}
