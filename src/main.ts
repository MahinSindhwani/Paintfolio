import '98.css';
import './styles/tokens.css';
import './styles/chrome.css';
import './styles/canvas.css';

import { createTitleBar } from './chrome/titlebar';
import { createMenuBar } from './chrome/menubar';
import { createToolbar } from './chrome/toolbar';
import { createPalette } from './chrome/palette';
import { createStatusBar } from './chrome/statusbar';
import { setupPaintCanvas } from './paint/canvas';
import { setupPointerInput } from './paint/pointer';
import { loadPersistedCommands, redo, undo } from './state/commands';

const app = document.getElementById('app');
if (!app) throw new Error('missing #app root element');

const paintMain = document.createElement('div');
paintMain.className = 'paint-main';
paintMain.append(createToolbar(), createCanvasWell());

const paintWindow = document.createElement('div');
paintWindow.className = 'window paint-window';
paintWindow.append(
  createTitleBar(),
  createMenuBar(),
  paintMain,
  createPalette(),
  createStatusBar(),
);

app.append(paintWindow);

/* The canvas sizes itself from the laid-out viewport, so wiring must happen
   after the window is in the DOM. */
const canvasViewport = paintWindow.querySelector<HTMLElement>('.canvas-viewport');
const paperElement = paintWindow.querySelector<HTMLElement>('.paper');
const paintCanvas = paintWindow.querySelector<HTMLCanvasElement>('.paint-canvas');
const hitLayer = paintWindow.querySelector<HTMLElement>('.hit-layer');
if (!canvasViewport || !paperElement || !paintCanvas || !hitLayer) {
  throw new Error('canvas well is missing a layer');
}
setupPaintCanvas({ viewport: canvasViewport, paper: paperElement, canvas: paintCanvas, hitLayer });
setupPointerInput(hitLayer);
loadPersistedCommands();

window.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undo();
  } else if ((key === 'z' && event.shiftKey) || key === 'y') {
    event.preventDefault();
    redo();
  }
});

/* Layer stacking comes from DOM order — no z-index. */
function createCanvasWell(): HTMLElement {
  const paper = document.createElement('div');
  paper.className = 'paper';

  const canvas = document.createElement('canvas');
  canvas.className = 'paint-canvas';

  const hitLayerElement = document.createElement('div');
  hitLayerElement.className = 'hit-layer';

  const viewport = document.createElement('div');
  viewport.className = 'canvas-viewport';
  viewport.append(paper, canvas, hitLayerElement);

  const corner = document.createElement('div');
  corner.className = 'scrollbar-corner';

  const well = document.createElement('div');
  well.className = 'canvas-well sunken';
  well.append(
    viewport,
    createScrollbar('vertical', 'up', 'down'),
    createScrollbar('horizontal', 'left', 'right'),
    corner,
  );
  return well;
}

function createScrollbar(
  orientation: 'vertical' | 'horizontal',
  startArrow: string,
  endArrow: string,
): HTMLElement {
  const track = document.createElement('div');
  track.className = 'scrollbar-track';

  const scrollbar = document.createElement('div');
  scrollbar.className = `scrollbar scrollbar-${orientation}`;
  scrollbar.append(createScrollArrowButton(startArrow), track, createScrollArrowButton(endArrow));
  return scrollbar;
}

function createScrollArrowButton(direction: string): HTMLButtonElement {
  const image = document.createElement('img');
  image.src = `/icons/arrow-${direction}.png`;
  image.width = 8;
  image.height = 8;
  image.alt = '';
  image.draggable = false;

  const button = document.createElement('button');
  button.className = 'scroll-button';
  button.type = 'button';
  button.tabIndex = -1;
  button.setAttribute('aria-hidden', 'true');
  button.append(image);
  return button;
}
