import { el } from './dom';
import { pixelSvg, APP_ICON } from './icons';

export function createTitleBar(): HTMLElement {
  const icon = el('span', 'title-bar-icon');
  icon.innerHTML = pixelSvg(APP_ICON);

  const text = el('div', 'title-bar-text', [icon, 'untitled - Paint']);
  const controls = el('div', 'title-bar-controls', [
    controlButton('Minimize'),
    controlButton('Maximize'),
    controlButton('Close'),
  ]);

  return el('div', 'title-bar', [text, controls]);
}

function controlButton(label: string): HTMLButtonElement {
  const button = el('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}
