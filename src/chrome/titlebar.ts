import { pixelArtToSvg, APP_ICON } from './icons';

export function createTitleBar(): HTMLElement {
  const icon = document.createElement('span');
  icon.className = 'title-bar-icon';
  icon.innerHTML = pixelArtToSvg(APP_ICON);

  const text = document.createElement('div');
  text.className = 'title-bar-text';
  text.append(icon, 'untitled - Paint');

  const controls = document.createElement('div');
  controls.className = 'title-bar-controls';
  controls.append(
    createWindowControlButton('Minimize'),
    createWindowControlButton('Maximize'),
    createWindowControlButton('Close'),
  );

  const titleBar = document.createElement('div');
  titleBar.className = 'title-bar';
  titleBar.append(text, controls);
  return titleBar;
}

function createWindowControlButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}
