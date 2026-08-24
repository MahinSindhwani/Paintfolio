import { createElement } from './dom';
import { pixelArtToSvg, APP_ICON } from './icons';

export function createTitleBar(): HTMLElement {
  const icon = createElement('span', 'title-bar-icon');
  icon.innerHTML = pixelArtToSvg(APP_ICON);

  const text = createElement('div', 'title-bar-text', [icon, 'untitled - Paint']);
  const controls = createElement('div', 'title-bar-controls', [
    createWindowControlButton('Minimize'),
    createWindowControlButton('Maximize'),
    createWindowControlButton('Close'),
  ]);

  return createElement('div', 'title-bar', [text, controls]);
}

function createWindowControlButton(label: string): HTMLButtonElement {
  const button = createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}
