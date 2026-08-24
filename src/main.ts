import '98.css';
import './styles/tokens.css';
import './styles/chrome.css';
import './styles/canvas.css';

import { createElement } from './chrome/dom';
import { pixelArtToSvg, ARROW_ICONS, type ArrowDirection } from './chrome/icons';
import { createTitleBar } from './chrome/titlebar';
import { createMenuBar } from './chrome/menubar';
import { createToolbar } from './chrome/toolbar';
import { createPalette } from './chrome/palette';
import { createStatusBar } from './chrome/statusbar';

const app = document.getElementById('app');
if (!app) throw new Error('missing #app root element');

app.append(
  createElement('div', 'window paint-window', [
    createTitleBar(),
    createMenuBar(),
    createElement('div', 'paint-main', [createToolbar(), createCanvasWell()]),
    createPalette(),
    createStatusBar(),
  ]),
);

/* The well holds the paper and decorative scrollbars. Real page rects and
   the hit layer arrive with later build items; this is display only. */
function createCanvasWell(): HTMLElement {
  const viewport = createElement('div', 'canvas-viewport', [createElement('div', 'paper')]);
  const vertical = createElement('div', 'scrollbar scrollbar-vertical', [
    createScrollArrowButton('up'),
    createElement('div', 'scrollbar-track'),
    createScrollArrowButton('down'),
  ]);
  const horizontal = createElement('div', 'scrollbar scrollbar-horizontal', [
    createScrollArrowButton('left'),
    createElement('div', 'scrollbar-track'),
    createScrollArrowButton('right'),
  ]);
  const corner = createElement('div', 'scrollbar-corner');
  return createElement('div', 'canvas-well sunken', [viewport, vertical, horizontal, corner]);
}

function createScrollArrowButton(direction: ArrowDirection): HTMLButtonElement {
  const button = createElement('button', 'scroll-button');
  button.type = 'button';
  button.tabIndex = -1;
  button.setAttribute('aria-hidden', 'true');
  button.innerHTML = pixelArtToSvg(ARROW_ICONS[direction], 8);
  return button;
}
