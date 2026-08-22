import '98.css';
import './styles/tokens.css';
import './styles/chrome.css';
import './styles/canvas.css';

import { el } from './chrome/dom';
import { pixelSvg, ARROW_ICONS, type ArrowDirection } from './chrome/icons';
import { createTitleBar } from './chrome/titlebar';
import { createMenuBar } from './chrome/menubar';
import { createToolbar } from './chrome/toolbar';
import { createPalette } from './chrome/palette';
import { createStatusBar } from './chrome/statusbar';

const app = document.getElementById('app');
if (!app) throw new Error('missing #app root element');

app.append(
  el('div', 'window paint-window', [
    createTitleBar(),
    createMenuBar(),
    el('div', 'paint-main', [createToolbar(), createCanvasWell()]),
    createPalette(),
    createStatusBar(),
  ]),
);

/* The well holds the paper and decorative scrollbars. Real page rects and
   the hit layer arrive with later build items; this is display only. */
function createCanvasWell(): HTMLElement {
  const viewport = el('div', 'canvas-viewport', [el('div', 'paper')]);
  const vertical = el('div', 'scrollbar scrollbar-vertical', [
    scrollButton('up'),
    el('div', 'scrollbar-track'),
    scrollButton('down'),
  ]);
  const horizontal = el('div', 'scrollbar scrollbar-horizontal', [
    scrollButton('left'),
    el('div', 'scrollbar-track'),
    scrollButton('right'),
  ]);
  const corner = el('div', 'scrollbar-corner');
  return el('div', 'canvas-well sunken', [viewport, vertical, horizontal, corner]);
}

function scrollButton(direction: ArrowDirection): HTMLButtonElement {
  const button = el('button', 'scroll-button');
  button.type = 'button';
  button.tabIndex = -1;
  button.setAttribute('aria-hidden', 'true');
  button.innerHTML = pixelSvg(ARROW_ICONS[direction], 8);
  return button;
}
