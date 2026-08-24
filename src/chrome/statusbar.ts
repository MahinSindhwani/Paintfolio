import { createElement } from './dom';

export function createStatusBar(): HTMLElement {
  const help = createElement('div', 'status-bar-field status-help', [
    'For Help, click Help Topics on the Help Menu.',
  ]);
  return createElement('div', 'status-bar', [
    help,
    createElement('div', 'status-bar-field status-cell'),
    createElement('div', 'status-bar-field status-cell'),
  ]);
}
